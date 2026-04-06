import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RESIDENT_LANGUAGE_OPTIONS } from '@/lib/residents/languages';

import type { ResidentDirectoryStats } from './residents-directory-utils';

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="@container/card">
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ResidentsDirectorySummary({
  totalResidents,
  telegramCount,
  messengerCount,
  languageCounts,
  unknownLanguageCount,
}: ResidentDirectoryStats) {
  const languageSplit = [
    ...RESIDENT_LANGUAGE_OPTIONS.map(
      ({ value, label }) => `${label} ${languageCounts[value]}`
    ),
    ...(unknownLanguageCount > 0 ? [`Unknown ${unknownLanguageCount}`] : []),
  ].join(' / ');

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SummaryCard
        label="Total residents"
        value={totalResidents.toString()}
        description="All onboarded resident profiles in the control center, including incomplete records."
      />
      <SummaryCard
        label="Telegram"
        value={telegramCount.toString()}
        description="Residents connected through the Telegram adapter."
      />
      <SummaryCard
        label="Messenger"
        value={messengerCount.toString()}
        description="Residents connected through the Messenger adapter."
      />
      <SummaryCard
        label="Language split"
        value={languageSplit}
        description="Preferred response language captured during onboarding."
      />
    </div>
  );
}
