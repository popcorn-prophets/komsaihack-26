import { ThemeSwitcher } from '@/components/theme-switcher';
import { WebChatInterface } from '@/components/web-chat-interface';

export default function WebChatPage() {
  return (
    <main className="mx-auto flex h-[calc(100svh-4rem)] min-h-[calc(100svh-4rem)] w-full max-w-4xl flex-col px-3 py-3 sm:px-6 sm:py-4">
      <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
        <div className="space-y-1"></div>
        <ThemeSwitcher />
      </div>

      <WebChatInterface className="h-full min-h-0 flex-1" />
    </main>
  );
}
