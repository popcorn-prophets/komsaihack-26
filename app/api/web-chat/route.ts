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
  metadata?: {
    dateSent?: string;
  };
};

type WebChatMessage = {
  actions?: WebChatCardAction[];
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
};

type PersistedActionCache = {
  actions?: WebChatCardAction[];
};

function getChatHistoryListKey(threadId: string) {
  return `${CHAT_MESSAGE_HISTORY_PREFIX}${threadId}`;
}

function parsePersistedChatMessage(value: string): WebChatMessage | null {
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
    eventType?: unknown;
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
  const userName =
    typeof payload.userName === 'string' ? payload.userName.trim() : undefined;
  const value = typeof payload.value === 'string' ? payload.value : undefined;

  if (!isValidSessionId(sessionId)) {
    return toErrorResponse('Valid sessionId is required.', 400);
  }

  if (eventType === 'message' && !message) {
    return toErrorResponse('message is required.', 400);
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
      eventType,
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
