'use client';

import { WebChatInterface } from '@/components/web-chat-interface';

export function WebChatDemoSection() {
  return (
    <section className="relative w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Live Web Chat Demo
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Experience HERMES as if it were a real messaging app.
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            This in-page mockup uses the same chatbot flows used in production
            channels, so you can simulate real-world incident reporting without
            leaving the website.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative rounded-[2.5rem] border border-foreground/15 bg-gradient-to-b from-zinc-200 to-zinc-300 p-2 shadow-2xl dark:from-zinc-800 dark:to-zinc-900">
            <div className="absolute left-1/2 top-2 h-5 w-36 -translate-x-1/2 rounded-b-2xl bg-zinc-900/95" />

            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-background">
              <div className="h-[min(72vh,740px)] min-h-[560px]">
                <WebChatInterface
                  title="HERMES Mobile Chat"
                  description="Demo simulation on the web interface"
                  className="h-full rounded-none border-0 shadow-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
