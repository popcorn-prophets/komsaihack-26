import {
  IconShieldCog,
  IconShieldPlus,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SummaryCard = {
  title: string;
  description: string;
  value: string;
  icon: typeof IconUsers;
};

export function AdminSummaryCards({
  activeStaffCount,
  privilegedStaffCount,
  responderCount,
  pendingInviteCount,
}: {
  activeStaffCount: number;
  privilegedStaffCount: number;
  responderCount: number;
  pendingInviteCount: number;
}) {
  const cards: SummaryCard[] = [
    {
      title: 'Active staff',
      description: 'Signed-up admin and responder accounts',
      value: String(activeStaffCount),
      icon: IconUsers,
    },
    {
      title: 'Privileged access',
      description: 'Super admins and admins with panel access',
      value: String(privilegedStaffCount),
      icon: IconShieldCog,
    },
    {
      title: 'Responders',
      description: 'Operational accounts ready for incident workflows',
      value: String(responderCount),
      icon: IconUserCheck,
    },
    {
      title: 'Pending invites',
      description: 'Single-use invites awaiting account setup',
      value: String(pendingInviteCount),
      icon: IconShieldPlus,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-3">
              <CardDescription>{card.title}</CardDescription>
              <card.icon className="text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {card.value}
            </CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
