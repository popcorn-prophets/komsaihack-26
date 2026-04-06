'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';

type WebChatAction = {
  id: string;
  label: string;
  style?: 'default' | 'primary' | 'danger';
  value: string;
};

type WebChatMessage = {
  actions?: WebChatAction[];
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
};

interface WebChatInterfaceProps {
  apiEndpoint?: string;
  className?: string;
  description?: string;
  title?: string;
  userName?: string;
}

const SESSION_STORAGE_KEY = 'hermes-webchat-session-id';

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `webchat_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  return `webchat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function WebChatInterface({
  apiEndpoint = '/api/web-chat',
  className,
  description = 'Use HERMES Web Chat as an alternative interface to the same chatbot pipeline.',
  title = 'HERMES Web Chat',
  userName = 'web-chat-user',
}: WebChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WebChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(SESSION_STORAGE_KEY)?.trim();
      if (existing) {
        setSessionId(existing);
        setIsBootstrapping(false);
        return;
      }

      const generated = createSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, generated);
      setSessionId(generated);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${apiEndpoint}?sessionId=${encodeURIComponent(sessionId)}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          messages?: WebChatMessage[];
        };

        if (isMounted) {
          setMessages(payload.messages ?? []);
        }
      } catch {
        if (isMounted) {
          setMessages([]);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [apiEndpoint, sessionId]);

  const isSendDisabled =
    isLoading || isBootstrapping || !sessionId || input.trim().length === 0;

  const helperText = useMemo(() => {
    if (messages.length > 0) {
      return 'Try: report, quick report, status, or settings';
    }

    return 'Start by saying hi, then follow the bot prompts.';
  }, [messages.length]);

  async function sendEvent(payload: {
    actionId?: string;
    actionMessageId?: string;
    eventType: 'action' | 'message';
    message?: string;
    value?: string;
  }): Promise<void> {
    if (!sessionId) {
      return;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionId: payload.actionId,
        actionMessageId: payload.actionMessageId,
        eventType: payload.eventType,
        sessionId,
        message: payload.message,
        userName,
        value: payload.value,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to send message.');
    }

    const responsePayload = (await response.json()) as {
      messages?: WebChatMessage[];
    };

    setMessages(responsePayload.messages ?? []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || !sessionId || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await sendEvent({
        eventType: 'message',
        message,
      });
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleActionClick(
    action: WebChatAction,
    messageId: string
  ): Promise<void> {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await sendEvent({
        actionId: action.id,
        actionMessageId: messageId,
        eventType: 'action',
        value: action.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="h-112 p-0 sm:h-136">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-3 p-4">
            {messages.length === 0 && !isLoading ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {helperText}
              </div>
            ) : null}

            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      isAssistant
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="wrap-break-word whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`mt-1 text-[11px] ${
                        isAssistant
                          ? 'text-muted-foreground'
                          : 'text-primary-foreground/80'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {isAssistant &&
                    message.actions &&
                    message.actions.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.actions.map((action) => {
                          const variant =
                            action.style === 'danger'
                              ? 'destructive'
                              : action.style === 'primary'
                                ? 'default'
                                : 'secondary';

                          return (
                            <Button
                              key={`${message.id}:${action.id}:${action.value}`}
                              type="button"
                              size="sm"
                              variant={variant}
                              disabled={isLoading}
                              onClick={() => {
                                void handleActionClick(action, message.id);
                              }}
                            >
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-3">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message..."
            disabled={isLoading || isBootstrapping}
          />
          <Button type="submit" size="icon" disabled={isSendDisabled}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
