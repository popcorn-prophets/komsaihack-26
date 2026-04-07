'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircleMore, Send } from 'lucide-react';

const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL?.trim();
const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim();

const channels = [
  {
    href: messengerUrl,
    icon: MessageCircleMore,
    label: 'Messenger',
  },
  {
    href: telegramUrl,
    icon: Send,
    label: 'Telegram',
  },
].filter(
  (
    channel
  ): channel is {
    href: string;
    icon: typeof MessageCircleMore;
    label: string;
  } => Boolean(channel.href)
);

interface ChatChannelLinksProps {
  className?: string;
  showLabel?: boolean;
}

export function ChatChannelLinks({
  className,
  showLabel = true,
}: ChatChannelLinksProps) {
  if (channels.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs text-muted-foreground',
        className
      )}
    >
      {showLabel ? <span>Prefer another channel?</span> : null}
      {channels.map((channel) => {
        const Icon = channel.icon;

        return (
          <Button
            key={channel.label}
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3"
          >
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${channel.label} chat link`}
              title={channel.label}
            >
              <Icon className="h-4 w-4" />
              <span>{channel.label}</span>
            </a>
          </Button>
        );
      })}
    </div>
  );
}
