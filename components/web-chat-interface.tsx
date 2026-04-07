'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Loader2,
  MapPin,
  Mic,
  Send,
  Square,
  X,
} from 'lucide-react';

type WebChatAction = {
  id: string;
  label: string;
  style?: 'default' | 'primary' | 'danger';
  value: string;
};

type WebChatMessage = {
  actions?: WebChatAction[];
  attachments?: WebChatAttachment[];
  id: string;
  content: string;
  role: 'user' | 'assistant';
  location?: PendingLocation;
  timestamp: string;
};

type WebChatAttachment = {
  data?: string;
  filename?: string;
  mimeType: string;
  type: 'audio' | 'file' | 'image';
};

type PendingAttachment = {
  data: string;
  filename?: string;
  mimeType: string;
  previewUrl?: string;
  type: 'audio' | 'file' | 'image';
};

type PendingLocation = {
  accuracy?: number;
  latitude: number;
  longitude: number;
};

interface WebChatInterfaceProps {
  apiEndpoint?: string;
  className?: string;
  description?: string;
  title?: string;
  userName?: string;
}

const SESSION_STORAGE_KEY = 'hermes-webchat-session-id';

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return `data:${file.type};base64,${btoa(binary)}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read blob.'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to encode blob.'));
    };
    reader.readAsDataURL(blob);
  });
}

function inferAttachmentType(mimeType: string): 'audio' | 'file' | 'image' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  return 'file';
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `webchat_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  return `webchat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="[&_p]:m-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black/10 [&_pre]:p-2 [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer noopener"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function WebChatInterface({
  apiEndpoint = '/api/web-chat',
  className,
  description = '',
  title = 'HERMES Web Chat',
  userName = 'web-chat-user',
}: WebChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WebChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [pendingLocation, setPendingLocation] =
    useState<PendingLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const chatViewportRootRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const viewport = chatViewportRootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      behavior: 'smooth',
      top: viewport.scrollHeight,
    });
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
    isLoading ||
    isBootstrapping ||
    !sessionId ||
    (input.trim().length === 0 && !pendingAttachment && !pendingLocation);

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
    attachments?: WebChatAttachment[];
    location?: PendingLocation;
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
        attachments: payload.attachments,
        eventType: payload.eventType,
        location: payload.location,
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
    if (!sessionId || isLoading) {
      return;
    }

    if (!message && !pendingAttachment && !pendingLocation) {
      return;
    }

    setIsLoading(true);

    try {
      await sendEvent({
        attachments: pendingAttachment
          ? [
              {
                data: pendingAttachment.data,
                filename: pendingAttachment.filename,
                mimeType: pendingAttachment.mimeType,
                type: pendingAttachment.type,
              },
            ]
          : undefined,
        eventType: 'message',
        location: pendingLocation ?? undefined,
        message,
      });
      setInput('');
      setPendingAttachment(null);
      setPendingLocation(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageSelection(file: File | null): Promise<void> {
    if (!file) {
      return;
    }

    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }

    const data = await fileToDataUrl(file);
    setPendingAttachment({
      data,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      previewUrl: URL.createObjectURL(file),
      type: inferAttachmentType(file.type || 'application/octet-stream'),
    });
  }

  async function handleLocationShare(): Promise<void> {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPendingLocation({
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Failed to get location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function startVoiceRecording(): Promise<void> {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recordingChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(recordingChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      const data = await blobToDataUrl(audioBlob);
      setPendingAttachment({
        data,
        filename: `voice-${Date.now()}.webm`,
        mimeType: recorder.mimeType || 'audio/webm',
        type: 'audio',
      });
      stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }

  function stopVoiceRecording(): void {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }

  async function clearPendingMedia(): Promise<void> {
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }

    setPendingAttachment(null);
    setPendingLocation(null);
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
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm',
        className
      )}
    >
      <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <div ref={chatViewportRootRef} className="h-full w-full">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col gap-3 px-3 py-4 sm:px-4">
              {messages.length === 0 && !isLoading ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {helperText}
                </div>
              ) : null}

              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                const hasAttachments =
                  Array.isArray(message.attachments) &&
                  message.attachments.length > 0;
                const hasLocation = Boolean(message.location);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm sm:max-w-[78%] ${
                        isAssistant
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="wrap-break-word whitespace-pre-wrap">
                        <MarkdownMessage content={message.content} />
                      </div>
                      {hasLocation ? (
                        <div className="mt-2 rounded-lg border border-current/10 bg-background/50 px-2 py-1 text-xs">
                          Location shared:{' '}
                          {message.location?.latitude?.toFixed(5)},{' '}
                          {message.location?.longitude?.toFixed(5)}
                        </div>
                      ) : null}
                      {hasAttachments ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {message.attachments?.map((attachment, index) => (
                            <div
                              key={`${message.id}:attachment:${index}`}
                              className="rounded-xl border border-current/10 bg-background/50 p-2"
                            >
                              {attachment.type === 'image' ||
                              attachment.mimeType?.startsWith('image/') ? (
                                attachment.data ? (
                                  <Image
                                    alt={
                                      attachment.filename ?? 'Attached image'
                                    }
                                    className="rounded-lg object-cover"
                                    src={attachment.data}
                                    width={320}
                                    height={240}
                                  />
                                ) : (
                                  <span>
                                    {attachment.filename
                                      ? `Image: ${attachment.filename}`
                                      : 'Image attached'}
                                  </span>
                                )
                              ) : attachment.type === 'audio' ||
                                attachment.mimeType?.startsWith('audio/') ? (
                                attachment.data ? (
                                  <audio
                                    controls
                                    src={attachment.data}
                                    className="max-w-72"
                                  />
                                ) : (
                                  <span>
                                    {attachment.filename
                                      ? `Audio: ${attachment.filename}`
                                      : 'Voice recording'}
                                  </span>
                                )
                              ) : (
                                <span>
                                  {attachment.filename
                                    ? `File: ${attachment.filename}`
                                    : 'File attached'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
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
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-background/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur sm:p-3">
        <div className="flex w-full flex-col gap-3">
          {pendingAttachment || pendingLocation ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-2 text-xs">
              {pendingAttachment ? (
                <div className="flex items-center gap-2 rounded-md bg-background px-2 py-1">
                  <span className="font-medium">
                    {pendingAttachment.type === 'image'
                      ? 'Image attached'
                      : pendingAttachment.type === 'audio'
                        ? 'Voice recording'
                        : 'File attached'}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      void clearPendingMedia();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              {pendingLocation ? (
                <div className="flex items-center gap-2 rounded-md bg-background px-2 py-1">
                  <span className="font-medium">
                    Location: {pendingLocation.latitude.toFixed(5)},{' '}
                    {pendingLocation.longitude.toFixed(5)}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setPendingLocation(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message..."
              disabled={isLoading || isBootstrapping}
              className="h-11 w-full sm:flex-1"
            />

            <input
              ref={imageInputRef}
              accept="image/*"
              aria-hidden="true"
              className="hidden"
              onChange={(event) => {
                void handleImageSelection(event.target.files?.[0] ?? null);
                event.target.value = '';
              }}
              type="file"
            />

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={isLoading || isBootstrapping}
                  onClick={() => {
                    imageInputRef.current?.click();
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={isLoading || isBootstrapping}
                  onClick={() => {
                    void handleLocationShare();
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant={isRecording ? 'destructive' : 'outline'}
                  disabled={isLoading || isBootstrapping}
                  onClick={() => {
                    if (isRecording) {
                      stopVoiceRecording();
                      return;
                    }

                    void startVoiceRecording();
                  }}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button type="submit" size="icon" disabled={isSendDisabled}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}
