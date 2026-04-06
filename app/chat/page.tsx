import { WebChatInterface } from '@/components/web-chat-interface';

export default function WebChatPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          HERMES Web Chat
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          This in-site interface routes your messages through the same bot
          service used by external messaging platforms.
        </p>
      </div>

      <WebChatInterface className="min-h-0 flex-1" />
    </main>
  );
}
