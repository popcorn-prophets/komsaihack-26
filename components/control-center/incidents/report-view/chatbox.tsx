/*
NOTE: THIS IS A PLACEHOLDER COMPONENT UNTIL
DIRECT CONNECTION WITH MESSAGING APPS IS INTEGRATED.

NOT INDICATIVE OF THE FINAL PRODUCT.
*/

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatBoxProps {
  incidentId?: string | null;
  onSendMessage?: (message: string) => void | Promise<void>;
  isLoading?: boolean;
  messages?: Message[];
  title?: string;
  description?: string;
}

export function ChatBox({
  incidentId,
  onSendMessage,
  isLoading = false,
  messages: initialMessages,
  title = 'Chat',
  description = 'Ask me anything',
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(isLoading);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update loading state from prop
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Keep local messages in sync when parent-provided messages change.
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Load thread history from Chat SDK for the selected incident.
  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!incidentId) {
        if (isMounted) {
          setMessages([]);
        }
        return;
      }

      if (isMounted) {
        setIsHistoryLoading(true);
      }

      try {
        const response = await fetch(
          `/api/incidents/${incidentId}/thread-messages`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load thread messages');
        }

        const payload = (await response.json()) as {
          messages?: Array<{
            id: string;
            content: string;
            role: 'user' | 'assistant';
            timestamp: string;
          }>;
        };

        if (!isMounted) {
          return;
        }

        const mappedMessages = (payload.messages ?? []).map((message) => ({
          id: message.id,
          content: message.content,
          role: message.role,
          timestamp: new Date(message.timestamp),
        }));

        setMessages(mappedMessages);
      } catch (error) {
        console.error('Error loading incident thread history:', error);
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [incidentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const messageText = input.trim();

    if (!messageText || loading || isHistoryLoading || !incidentId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/incidents/${incidentId}/thread-messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: messageText }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message to thread');
      }

      const payload = (await response.json()) as {
        message?: {
          id: string;
          content: string;
          role: 'user' | 'assistant';
          timestamp: string;
        };
      };

      const sentMessage = payload.message;

      if (sentMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: sentMessage.id,
            content: sentMessage.content,
            role: sentMessage.role,
            timestamp: new Date(sentMessage.timestamp),
          },
        ]);
      }

      setInput('');

      // Call the callback if provided
      if (onSendMessage) {
        await onSendMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-screen w-full">
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full w-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && !isHistoryLoading ? (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div className="space-y-2">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation by typing below
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <Card
                    className={`max-w-xs lg:max-w-md ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm wrap-break-word">
                        {message.content}
                      </p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            {(loading || isHistoryLoading) && (
              <div className="flex justify-start">
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <Card className="border-t m-0 rounded-none">
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || isHistoryLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || isHistoryLoading || !input.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Card>
  );
}
