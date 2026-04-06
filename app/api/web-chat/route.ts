import { bot } from '@/lib/bot';
import type { WebChatCardAction } from '@/lib/bot/adapters/web-chat';
import {
  encodeWebChatThreadId,
  getWebChatActionCacheKey,
} from '@/lib/bot/adapters/web-chat';
import { createAdminClient } from '@/lib/supabase/admin';

const CHAT_STATE_KEY_PREFIX = 'chat-sdk';
const CHAT_MESSAGE_HISTORY_PREFIX = 'msg-history:';
const MESSAGE_HISTORY_LIMIT = 100;

type PersistedChatMessage = {
  id?: string;
  text?: string;
  author?: {
    isMe?: boolean;
  };
  attachments?: Array<{
    data?: unknown;
    filename?: string;
    mimeType?: string;
    type?: 'audio' | 'file' | 'image';
  }>;
  location?: {
    accuracy?: number;
    latitude?: number;
    longitude?: number;
  };
  raw?: {
    attachments?: Array<{
      data?: unknown;
      filename?: string;
      mimeType?: string;
      type?: 'audio' | 'file' | 'image';
    }>;
    location?: {
      accuracy?: number;
      latitude?: number;
      longitude?: number;
    };
    text?: string;
  };
  metadata?: {
    dateSent?: string;
  };
};

type WebChatMessage = {
  actions?: WebChatCardAction[];
  attachments?: Array<{
    data?: string;
    filename?: string;
    mimeType?: string;
    type?: 'audio' | 'file' | 'image';
  }>;
  id: string;
  content: string;
  role: 'user' | 'assistant';
  location?: {
    accuracy?: number;
    latitude?: number;
    longitude?: number;
  };
  timestamp: string;
};

type PersistedActionCache = {
  actions?: WebChatCardAction[];
};

function getChatHistoryListKey(threadId: string) {
  return `${CHAT_MESSAGE_HISTORY_PREFIX}${threadId}`;
}

function summarizeAttachment(attachment: {
  data?: unknown;
  filename?: string;
  mimeType?: string;
  type?: 'audio' | 'file' | 'image';
}): string {
  if (
    attachment.type === 'image' ||
    attachment.mimeType?.startsWith('image/')
  ) {
    return attachment.filename
      ? `Image: ${attachment.filename}`
      : 'Image attached';
  }

  if (
    attachment.type === 'audio' ||
    attachment.mimeType?.startsWith('audio/')
  ) {
    return attachment.filename
      ? `Audio: ${attachment.filename}`
      : 'Voice recording';
  }

  return attachment.filename ? `File: ${attachment.filename}` : 'File attached';
}

function normalizeAttachmentData(attachment: {
  data?: unknown;
  filename?: string;
  mimeType?: string;
  type?: 'audio' | 'file' | 'image';
}): {
  data?: string;
  filename?: string;
  mimeType?: string;
  type?: 'audio' | 'file' | 'image';
} {
  const data = attachment.data;
  if (typeof data === 'string' && data.startsWith('data:')) {
    return {
      data,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      type: attachment.type,
    };
  }

  if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
    return {
      data,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      type: attachment.type,
    };
  }

  if (!data || typeof data !== 'object' || !('data' in data)) {
    return {
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      type: attachment.type,
    };
  }

  const rawBytes = (data as { data: number[] | Uint8Array }).data;
  const buffer = Buffer.from(rawBytes);
  const mimeType = attachment.mimeType ?? 'application/octet-stream';

  return {
    data: `data:${mimeType};base64,${buffer.toString('base64')}`,
    filename: attachment.filename,
    mimeType,
    type: attachment.type,
  };
}

function summarizeLocation(location?: {
  accuracy?: number;
  latitude?: number;
  longitude?: number;
}): string | undefined {
  if (!location) {
    return undefined;
  }

  return `Location shared: ${location.latitude?.toFixed(5) ?? ''}, ${location.longitude?.toFixed(5) ?? ''}`.trim();
}

function parsePersistedChatMessage(value: string): WebChatMessage | null {
  try {
    const parsed = JSON.parse(value) as PersistedChatMessage;
    const timestamp = parsed.metadata?.dateSent;
    const attachments = parsed.raw?.attachments ?? parsed.attachments ?? [];
    const location = parsed.raw?.location ?? parsed.location;
    const summaryParts = [
      parsed.text?.trim(),
      location ? summarizeLocation(location) : undefined,
      ...(Array.isArray(attachments)
        ? attachments.map(summarizeAttachment)
        : []),
    ].filter((part): part is string => Boolean(part && part.trim()));

    if (!parsed.id || !timestamp || summaryParts.length === 0) {
      return null;
    }

    return {
      id: parsed.id,
      attachments: Array.isArray(attachments)
        ? attachments
            .filter((attachment) => Boolean(attachment))
            .map((attachment) => normalizeAttachmentData(attachment))
        : undefined,
      content: summaryParts.join('\n'),
      role: parsed.author?.isMe ? 'assistant' : 'user',
      location,
      timestamp,
    };
  } catch {
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

  const messages = (data ?? [])
    .filter(
      (row) => !row.expires_at || new Date(row.expires_at).getTime() > now
    )
    .map((row) => parsePersistedChatMessage(row.value))
    .filter((message): message is WebChatMessage => message !== null)
    .slice(-MESSAGE_HISTORY_LIMIT);

  const assistantMessages = messages.filter(
    (message) => message.role === 'assistant'
  );

  if (assistantMessages.length === 0) {
    return messages;
  }

  const actionCacheKeys = assistantMessages.map((message) =>
    getWebChatActionCacheKey(threadId, message.id)
  );

  const { data: actionRows, error: actionError } = await supabase
    .from('chat_state_cache')
    .select('cache_key, value, expires_at')
    .eq('key_prefix', CHAT_STATE_KEY_PREFIX)
    .in('cache_key', actionCacheKeys);

  if (actionError) {
    throw actionError;
  }

  const actionMap = new Map<string, WebChatCardAction[]>();

  for (const row of actionRows ?? []) {
    if (row.expires_at && new Date(row.expires_at).getTime() <= now) {
      continue;
    }

    try {
      const parsed = JSON.parse(row.value) as PersistedActionCache;
      if (!Array.isArray(parsed.actions) || parsed.actions.length === 0) {
        continue;
      }

      actionMap.set(row.cache_key, parsed.actions);
    } catch {
      continue;
    }
  }

  return messages.map((message) => {
    if (message.role !== 'assistant') {
      return message;
    }

    const actions = actionMap.get(
      getWebChatActionCacheKey(threadId, message.id)
    );
    if (!actions || actions.length === 0) {
      return message;
    }

    return {
      ...message,
      actions,
    };
  });
}

function isValidSessionId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,120}$/.test(value);
}

function toErrorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId')?.trim() ?? '';

  if (!isValidSessionId(sessionId)) {
    return toErrorResponse('Valid sessionId is required.', 400);
  }

  const threadId = encodeWebChatThreadId(sessionId);

  try {
    const messages = await loadPersistedThreadMessages(threadId);
    return Response.json({ messages });
  } catch (error) {
    console.error('Failed to load web chat history:', error);
    return toErrorResponse('Failed to load web chat history.', 500);
  }
}

export async function POST(request: Request) {
  let payload: {
    actionId?: unknown;
    actionMessageId?: unknown;
    attachments?: unknown;
    eventType?: unknown;
    location?: unknown;
    sessionId?: unknown;
    message?: unknown;
    userName?: unknown;
    value?: unknown;
  };

  try {
    payload = (await request.json()) as {
      actionId?: unknown;
      actionMessageId?: unknown;
      eventType?: unknown;
      attachments?: unknown;
      sessionId?: unknown;
      message?: unknown;
      userName?: unknown;
      value?: unknown;
    };
  } catch {
    return toErrorResponse('Invalid JSON payload.', 400);
  }

  const sessionId =
    typeof payload.sessionId === 'string' ? payload.sessionId.trim() : '';
  const message =
    typeof payload.message === 'string' ? payload.message.trim() : '';
  const eventType =
    payload.eventType === 'action' ? 'action' : ('message' as const);
  const actionId =
    typeof payload.actionId === 'string' ? payload.actionId.trim() : '';
  const actionMessageId =
    typeof payload.actionMessageId === 'string'
      ? payload.actionMessageId.trim()
      : '';
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments
    : undefined;
  const location =
    payload.location && typeof payload.location === 'object'
      ? payload.location
      : undefined;
  const userName =
    typeof payload.userName === 'string' ? payload.userName.trim() : undefined;
  const value = typeof payload.value === 'string' ? payload.value : undefined;

  if (!isValidSessionId(sessionId)) {
    return toErrorResponse('Valid sessionId is required.', 400);
  }

  if (eventType === 'message' && !message && !attachments && !location) {
    return toErrorResponse(
      'message, attachments, or location is required.',
      400
    );
  }

  if (eventType === 'action' && (!actionId || !actionMessageId)) {
    return toErrorResponse(
      'actionId and actionMessageId are required for actions.',
      400
    );
  }

  const threadId = encodeWebChatThreadId(sessionId);

  const adapterRequest = new Request('http://local/webchat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actionId: eventType === 'action' ? actionId : undefined,
      actionMessageId: eventType === 'action' ? actionMessageId : undefined,
      attachments,
      eventType,
      location,
      sessionId,
      text: eventType === 'message' ? message : '',
      userName,
      value: eventType === 'action' ? value : undefined,
    }),
  });

  try {
    const adapterResponse = await bot.webhooks.webchat(adapterRequest);

    if (!adapterResponse.ok) {
      const errorText = await adapterResponse.text();
      return toErrorResponse(
        errorText || 'Failed to process chat message.',
        500
      );
    }

    const messages = await loadPersistedThreadMessages(threadId);
    return Response.json({ messages });
  } catch (error) {
    console.error('Failed to send web chat message:', error);
    return toErrorResponse('Failed to send web chat message.', 500);
  }
}
