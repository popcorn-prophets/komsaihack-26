import type {
  Adapter,
  AdapterPostableMessage,
  CardChild,
  CardElement,
  ChatInstance,
  EmojiValue,
  FetchOptions,
  FetchResult,
  FormattedContent,
  MessageData,
  RawMessage,
  ThreadInfo,
  WebhookOptions,
} from 'chat';
import {
  Message,
  NotImplementedError,
  isCardElement,
  markdownToPlainText,
  parseMarkdown,
  toPlainText,
} from 'chat';

export interface WebChatThreadId {
  channel: 'dm';
  sessionId: string;
}

export interface WebChatIncomingPayload {
  actionId?: string;
  actionMessageId?: string;
  eventType?: 'action' | 'message';
  sessionId: string;
  text: string;
  userName?: string;
  value?: string;
}

export interface WebChatCardAction {
  id: string;
  label: string;
  style?: 'default' | 'primary' | 'danger';
  value: string;
}

interface WebChatRawMessage {
  author: {
    isMe: boolean;
    userId: string;
    userName: string;
  };
  dateSent: string;
  id: string;
  text: string;
  threadId: string;
}

const THREAD_PREFIX = 'webchat:dm:';
const ACTION_CACHE_PREFIX = 'webchat:actions:';
const BOT_USER_ID = 'webchat-bot';
const BOT_USER_NAME = 'project_hermes_bot';
const ACTION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function createMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildAuthor(isMe: boolean, userName: string) {
  return {
    fullName: userName,
    isBot: isMe,
    isMe,
    userId: isMe ? BOT_USER_ID : `${userName}-user`,
    userName,
  } as const;
}

function toMessageText(message: AdapterPostableMessage): string {
  if (typeof message === 'string') {
    return message;
  }

  if ('raw' in message) {
    return message.raw;
  }

  if ('markdown' in message) {
    return markdownToPlainText(message.markdown);
  }

  if ('ast' in message) {
    return toPlainText(message.ast);
  }

  if ('card' in message) {
    return message.fallbackText ?? '[interactive card]';
  }

  if (isCardElement(message)) {
    return '[interactive card]';
  }

  return '[unsupported message]';
}

function toCardElement(message: AdapterPostableMessage): CardElement | null {
  if (typeof message !== 'string' && 'card' in message) {
    return message.card;
  }

  if (isCardElement(message)) {
    return message;
  }

  return null;
}

function collectActionsFromChildren(
  children: CardChild[]
): WebChatCardAction[] {
  const actions: WebChatCardAction[] = [];

  for (const child of children) {
    if (child.type === 'section') {
      actions.push(...collectActionsFromChildren(child.children));
      continue;
    }

    if (child.type !== 'actions') {
      continue;
    }

    for (const item of child.children) {
      if (item.type === 'button') {
        if (item.disabled) {
          continue;
        }

        actions.push({
          id: item.id,
          label: item.label,
          style: item.style,
          value: item.value ?? item.id,
        });
        continue;
      }

      if (item.type === 'select' || item.type === 'radio_select') {
        for (const option of item.options) {
          actions.push({
            id: item.id,
            label: option.label,
            value: option.value,
          });
        }
      }
    }
  }

  return actions;
}

function parseThreadId(threadId: string): WebChatThreadId {
  if (!threadId.startsWith(THREAD_PREFIX)) {
    throw new Error('Invalid web chat thread id.');
  }

  const sessionId = threadId.slice(THREAD_PREFIX.length);
  if (!sessionId) {
    throw new Error('Missing session id in web chat thread id.');
  }

  return {
    channel: 'dm',
    sessionId,
  };
}

function createMessage(raw: WebChatRawMessage): Message<WebChatRawMessage> {
  const data: MessageData<WebChatRawMessage> = {
    attachments: [],
    author: buildAuthor(raw.author.isMe, raw.author.userName),
    formatted: parseMarkdown(raw.text) as FormattedContent,
    id: raw.id,
    metadata: {
      dateSent: new Date(raw.dateSent),
      edited: false,
    },
    raw,
    text: raw.text,
    threadId: raw.threadId,
  };

  return new Message(data);
}

export function encodeWebChatThreadId(sessionId: string): string {
  return `${THREAD_PREFIX}${sessionId}`;
}

export function getWebChatActionCacheKey(
  threadId: string,
  messageId: string
): string {
  return `${ACTION_CACHE_PREFIX}${threadId}:${messageId}`;
}

class WebChatAdapter implements Adapter<WebChatThreadId, WebChatRawMessage> {
  readonly name = 'webchat';
  readonly persistMessageHistory = true;
  readonly userName = BOT_USER_NAME;

  private chat: ChatInstance | null = null;

  async initialize(chat: ChatInstance): Promise<void> {
    this.chat = chat;
  }

  encodeThreadId(platformData: WebChatThreadId): string {
    return `${THREAD_PREFIX}${platformData.sessionId}`;
  }

  decodeThreadId(threadId: string): WebChatThreadId {
    return parseThreadId(threadId);
  }

  channelIdFromThreadId(threadId: string): string {
    void threadId;
    return `${this.name}:dm`;
  }

  isDM(_threadId: string): boolean {
    void _threadId;

    return true;
  }

  parseMessage(raw: WebChatRawMessage): Message<WebChatRawMessage> {
    return createMessage(raw);
  }

  renderFormatted(content: FormattedContent): string {
    return toPlainText(content);
  }

  async handleWebhook(
    request: Request,
    options?: WebhookOptions
  ): Promise<Response> {
    if (!this.chat) {
      return Response.json(
        { error: 'Adapter is not initialized.' },
        { status: 500 }
      );
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }

    let payload: WebChatIncomingPayload;
    try {
      payload = (await request.json()) as WebChatIncomingPayload;
    } catch {
      return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const sessionId = payload.sessionId?.trim();
    const text = payload.text?.trim();

    if (!sessionId) {
      return Response.json(
        { error: 'sessionId is required.' },
        { status: 400 }
      );
    }

    const threadId = encodeWebChatThreadId(sessionId);
    const userName = payload.userName?.trim() || 'resident';

    async function awaitTaskRegistration(
      register: (waitUntil: (task: Promise<unknown>) => void) => void
    ): Promise<void> {
      await new Promise<void>((resolve, reject) => {
        try {
          register((task) => {
            void task.then(() => resolve()).catch(reject);
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    if (payload.eventType === 'action') {
      const actionId = payload.actionId?.trim();
      const actionMessageId = payload.actionMessageId?.trim();

      if (!actionId || !actionMessageId) {
        return Response.json(
          { error: 'actionId and actionMessageId are required for actions.' },
          { status: 400 }
        );
      }

      await awaitTaskRegistration((waitUntil) => {
        this.chat?.processAction(
          {
            adapter: this,
            actionId,
            messageId: actionMessageId,
            raw: payload,
            threadId,
            user: {
              fullName: userName,
              isBot: false,
              isMe: false,
              userId: `${sessionId}-resident`,
              userName,
            },
            value: payload.value,
          },
          { ...options, waitUntil }
        );
      });

      return Response.json({ ok: true, threadId });
    }

    if (!text) {
      return Response.json(
        { error: 'text is required for messages.' },
        { status: 400 }
      );
    }

    const raw: WebChatRawMessage = {
      author: {
        isMe: false,
        userId: `${sessionId}-resident`,
        userName,
      },
      dateSent: new Date().toISOString(),
      id: createMessageId(),
      text,
      threadId,
    };

    await awaitTaskRegistration((waitUntil) => {
      this.chat?.processMessage(this, threadId, this.parseMessage(raw), {
        ...options,
        waitUntil,
      });
    });

    return Response.json({ ok: true, threadId });
  }

  async fetchThread(threadId: string): Promise<ThreadInfo> {
    return {
      channelId: this.channelIdFromThreadId(threadId),
      id: threadId,
      isDM: true,
      metadata: {
        sessionId: this.decodeThreadId(threadId).sessionId,
      },
    };
  }

  async fetchMessages(
    _threadId: string,
    _options?: FetchOptions
  ): Promise<FetchResult<WebChatRawMessage>> {
    void _threadId;
    void _options;

    return { messages: [] };
  }

  async postMessage(
    threadId: string,
    message: AdapterPostableMessage
  ): Promise<RawMessage<WebChatRawMessage>> {
    const messageId = createMessageId();
    const text = toMessageText(message);
    const card = toCardElement(message);

    if (card && this.chat) {
      const actions = collectActionsFromChildren(card.children);

      if (actions.length > 0) {
        const actionCacheKey = getWebChatActionCacheKey(threadId, messageId);
        await this.chat
          .getState()
          .set(actionCacheKey, { actions }, ACTION_CACHE_TTL_MS);
      }
    }

    return {
      id: messageId,
      raw: {
        author: {
          isMe: true,
          userId: BOT_USER_ID,
          userName: BOT_USER_NAME,
        },
        dateSent: new Date().toISOString(),
        id: messageId,
        text,
        threadId,
      },
      threadId,
    };
  }

  async editMessage(
    _threadId: string,
    _messageId: string,
    _message: AdapterPostableMessage
  ): Promise<RawMessage<WebChatRawMessage>> {
    void _threadId;
    void _messageId;
    void _message;

    throw new NotImplementedError(
      'Message editing is not supported.',
      'editMessage'
    );
  }

  async deleteMessage(_threadId: string, _messageId: string): Promise<void> {
    void _threadId;
    void _messageId;

    throw new NotImplementedError(
      'Message deletion is not supported.',
      'deleteMessage'
    );
  }

  async addReaction(
    _threadId: string,
    _messageId: string,
    _emoji: EmojiValue | string
  ): Promise<void> {
    void _threadId;
    void _messageId;
    void _emoji;

    throw new NotImplementedError(
      'Reactions are not supported.',
      'addReaction'
    );
  }

  async removeReaction(
    _threadId: string,
    _messageId: string,
    _emoji: EmojiValue | string
  ): Promise<void> {
    void _threadId;
    void _messageId;
    void _emoji;

    throw new NotImplementedError(
      'Reactions are not supported.',
      'removeReaction'
    );
  }

  async startTyping(_threadId: string, _status?: string): Promise<void> {
    void _threadId;
    void _status;

    // No-op for web chat adapter.
  }
}

export function createWebChatAdapter(): Adapter<
  WebChatThreadId,
  WebChatRawMessage
> {
  return new WebChatAdapter();
}
