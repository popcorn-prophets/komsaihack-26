import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

export function SectionCards() {
  const cardsData = [
    {
      description: 'Average Response Time',
      title: '12 min',
      badge: { icon: IconTrendingDown, text: '-15%' }, // Lower is better
      footerMain: 'Faster than last period',
      footerIcon: IconTrendingDown,
      footerSub: 'Goal: under 15 minutes',
    },
    {
      description: 'Structured Reports',
      title: '87%',
      badge: { icon: IconTrendingUp, text: '+8%' }, // Higher is better
      footerMain: 'Successfully auto-structured',
      footerIcon: IconTrendingUp,
      footerSub: 'NLP engine accuracy improving',
    },
    {
      description: 'Active Incidents',
      title: '24',
      badge: { icon: IconTrendingDown, text: '-10%' }, // Lower number of active incidents
      footerMain: 'Down from last week',
      footerIcon: IconTrendingDown,
      footerSub: 'Monitoring ongoing responses',
    },
    {
      description: 'Resident Engagement',
      title: '1,452 messages',
      badge: { icon: IconTrendingUp, text: '+20%' },
      footerMain: 'More reports and inquiries',
      footerIcon: IconTrendingUp,
      footerSub: 'Across Telegram & Messenger',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cardsData.map((card, idx) => (
        <Card key={idx} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.title}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={
                  card.badge.icon === IconTrendingUp
                    ? 'text-green-400 border-green-400'
                    : 'text-red-400 border-red-400'
                }
              >
                <card.badge.icon />
                {card.badge.text}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerMain} <card.footerIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">{card.footerSub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
