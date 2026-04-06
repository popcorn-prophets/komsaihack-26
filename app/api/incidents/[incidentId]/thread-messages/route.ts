import { ThreadImpl, deriveChannelId } from 'chat';

import { requireRole } from '@/lib/auth/dal';
import { adapters, state as botState } from '@/lib/bot/adapters';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/supabase';

type AdapterName = keyof typeof adapters;

const CHAT_STATE_KEY_PREFIX = 'chat-sdk';
const CHAT_MESSAGE_HISTORY_PREFIX = 'msg-history:';

type ThreadMessageResponse = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
};

type ThreadResolution = {
  thread: ThreadImpl;
  threadId: string;
};

type PersistedChatMessage = {
  _type?: string;
  id?: string;
  text?: string;
  author?: {
    isMe?: boolean;
  };
  metadata?: {
    dateSent?: string;
  };
  value?: string;
};

const MESSAGE_HISTORY_LIMIT = 100;

function getChatHistoryListKey(threadId: string) {
  return `${CHAT_MESSAGE_HISTORY_PREFIX}${threadId}`;
}

function parsePersistedChatMessage(
  value: string
): ThreadMessageResponse | null {
  try {
    const parsed = JSON.parse(value) as PersistedChatMessage;
    const timestamp = parsed.metadata?.dateSent;

    if (!parsed.id || !parsed.text || !timestamp) {
      return null;
    }

    return {
      id: parsed.id,
      content: parsed.text,
      role: parsed.author?.isMe ? 'assistant' : 'user',
      timestamp,
    };
  } catch (error) {
    console.error('Failed to parse persisted chat message:', error);
    return null;
  }
}

async function loadPersistedThreadMessages(threadId: string) {
  const supabase = createAdminClient();
  const listKey = getChatHistoryListKey(threadId);

  const { data, error } = await supabase
    .from('chat_state_lists')
    .select('value, expires_at')
    .eq('key_prefix', CHAT_STATE_KEY_PREFIX)
    .eq('list_key', listKey)
    .order('seq', { ascending: true });

  if (error) {
    throw error;
  }

  const now = Date.now();

  return (data ?? [])
    .filter(
      (row) => !row.expires_at || new Date(row.expires_at).getTime() > now
    )
    .map((row) => parsePersistedChatMessage(row.value))
    .filter((message): message is ThreadMessageResponse => message !== null)
    .slice(-MESSAGE_HISTORY_LIMIT);
}

async function resolveIncidentThread(
  incidentId: string
): Promise<ThreadResolution | null> {
  const supabase = createAdminClient();

  const { data: incident, error: incidentError } = await supabase
    .from('incidents')
    .select('reported_by')
    .eq('id', incidentId)
    .maybeSingle();

  if (incidentError) {
    throw new Error('Failed to resolve incident.');
  }

  if (!incident?.reported_by) {
    return null;
  }

  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select('thread_id, platform')
    .eq('id', incident.reported_by)
    .maybeSingle();

  if (residentError) {
    throw new Error('Failed to resolve incident thread.');
  }

  if (!resident?.thread_id) {
    return null;
  }

  const adapterName = resident.thread_id.split(':', 1)[0] as AdapterName;
  const adapter =
    adapters[adapterName] ??
    adapters[
      resident.platform as Database['public']['Enums']['resident_platform']
    ];

  if (!adapter) {
    return null;
  }

  const thread = new ThreadImpl({
    id: resident.thread_id,
    channelId: deriveChannelId(adapter, resident.thread_id),
    adapter,
    stateAdapter: botState,
    isDM: true,
  });

  return {
    thread,
    threadId: resident.thread_id,
  };
}

export async function GET(
  _request: Request,
  context: RouteContext<'/api/incidents/[incidentId]/thread-messages'>
) {
  await requireRole(['responder', 'admin', 'super_admin']);

  const { incidentId } = await context.params;

  if (!incidentId) {
    return Response.json(
      { error: 'Incident id is required.' },
      { status: 400 }
    );
  }

  let resolution: ThreadResolution | null = null;

  try {
    resolution = await resolveIncidentThread(incidentId);
  } catch (error) {
    console.error('Failed to resolve incident thread for history:', {
      incidentId,
      error,
    });

    return Response.json(
      { error: 'Failed to resolve incident thread.' },
      { status: 500 }
    );
  }

  if (!resolution) {
    return Response.json({ messages: [] });
  }

  try {
    const messages = await loadPersistedThreadMessages(resolution.threadId);

    return Response.json({ messages });
  } catch (error) {
    console.error('Failed to fetch thread history for incident:', {
      incidentId,
      threadId: resolution.threadId,
      error,
    });

    return Response.json(
      { error: 'Failed to read thread history.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext<'/api/incidents/[incidentId]/thread-messages'>
) {
  await requireRole(['responder', 'admin', 'super_admin']);

  const { incidentId } = await context.params;

  if (!incidentId) {
    return Response.json(
      { error: 'Incident id is required.' },
      { status: 400 }
    );
  }

  let message = '';

  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === 'string' ? body.message.trim() : '';
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!message) {
    return Response.json({ error: 'Message is required.' }, { status: 400 });
  }

  let resolution: ThreadResolution | null = null;

  try {
    resolution = await resolveIncidentThread(incidentId);
  } catch (error) {
    console.error('Failed to resolve incident thread for send:', {
      incidentId,
      error,
    });

    return Response.json(
      { error: 'Failed to resolve incident thread.' },
      { status: 500 }
    );
  }

  if (!resolution) {
    return Response.json(
      { error: 'No thread found for this incident.' },
      { status: 404 }
    );
  }

  try {
    const sent = await resolution.thread.post(message);

    return Response.json({
      message: {
        id: sent.id,
        content: sent.text,
        role: sent.author.isMe ? 'assistant' : 'user',
        timestamp: sent.metadata.dateSent.toISOString(),
      } as ThreadMessageResponse,
    });
  } catch (error) {
    console.error('Failed to send thread message for incident:', {
      incidentId,
      threadId: resolution.threadId,
      error,
    });

    return Response.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
