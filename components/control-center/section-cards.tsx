import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardPayload } from '@/lib/control-center-dashboard';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

function formatMinutes(value: number | null) {
  if (value === null) return 'N/A';
  return `${value} min`;
}

type SectionCardsProps = {
  kpis: DashboardPayload['kpis'];
};

export function SectionCards({ kpis }: SectionCardsProps) {
  const cardsData = [
    {
      description: 'Average delay',
      title: formatMinutes(kpis.avgIntakeMinutes),
      badge: {
        icon:
          kpis.avgIntakeMinutes !== null && kpis.avgIntakeMinutes <= 15
            ? IconTrendingDown
            : IconTrendingUp,
        text:
          kpis.avgIntakeMinutes !== null && kpis.avgIntakeMinutes <= 15
            ? 'On target'
            : 'Review',
      },
      footerMain: `${kpis.newIncidents24h} new incidents in the last 24h`,
      footerIcon: IconTrendingUp,
      footerSub: 'Target delay is below 15 minutes.',
    },
    {
      description: 'High-severity incidents',
      title: kpis.openHighSeverityCount.toLocaleString(),
      badge: {
        icon:
          kpis.openHighSeverityCount > 0 ? IconTrendingUp : IconTrendingDown,
        text: kpis.openHighSeverityCount > 0 ? 'Needs attention' : 'Stable',
      },
      footerMain: `${kpis.activeIncidents.toLocaleString()} total active incidents`,
      footerIcon: IconTrendingUp,
      footerSub: 'Counts include high and critical incidents only.',
    },
    {
      description: 'Active responders',
      title: kpis.activeResponders.toLocaleString(),
      badge: { icon: IconTrendingUp, text: 'Live staffing' },
      footerMain:
        kpis.pendingInvites !== null
          ? `${kpis.pendingInvites.toLocaleString()} pending staff invites`
          : 'Invite queue visible to admins only',
      footerIcon: IconTrendingUp,
      footerSub: 'Available responder count from staff directory data.',
    },
    {
      description: 'New incidents (24h)',
      title: kpis.newIncidents24h.toLocaleString(),
      badge: {
        icon: kpis.newIncidents24h > 0 ? IconTrendingUp : IconTrendingDown,
        text: kpis.newIncidents24h > 0 ? 'Intake active' : 'Quiet window',
      },
      footerMain: `${kpis.activeIncidents.toLocaleString()} incidents currently active`,
      footerIcon: IconTrendingUp,
      footerSub: 'New, validated, and in-progress statuses.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cardsData.map((card, idx) => (
        <Card key={idx} className="@container/card">
          <CardHeader>
            <CardDescription className="min-h-9">
              {card.description}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
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
