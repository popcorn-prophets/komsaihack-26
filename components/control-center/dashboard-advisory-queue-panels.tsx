'use client';

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DashboardPayload } from '@/lib/control-center-dashboard';

const pressureChartConfig = {
  value: {
    label: 'Value',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type DashboardAdvisoryQueuePanelsProps = {
  advisorySummary: DashboardPayload['advisorySummary'];
  kpis: DashboardPayload['kpis'];
  workflowSummary: DashboardPayload['workflowSummary'];
};

type PressureMetric = {
  label: string;
  value: number;
  suffix?: string;
  tone: 'neutral' | 'warning' | 'critical';
  accent: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DashboardAdvisoryQueuePanels({
  advisorySummary,
  kpis,
  workflowSummary,
}: DashboardAdvisoryQueuePanelsProps) {
  const isMobile = useIsMobile();
  const openIncidentCount =
    workflowSummary.openIncidentCount ??
    workflowSummary.counts.new +
      workflowSummary.counts.validated +
      workflowSummary.counts.in_progress;
  const oldestOpenDays =
    workflowSummary.oldestOpenIncidentMinutes !== null
      ? Math.max(1, Math.ceil(workflowSummary.oldestOpenIncidentMinutes / 1440))
      : null;

  const pressureMetrics: PressureMetric[] = [
    {
      label: 'Open Incidents',
      value: openIncidentCount,
      tone: 'neutral',
      accent: 'var(--chart-2)',
    },
    {
      label: 'High/Critical Open',
      value: kpis.openHighSeverityCount,
      tone: kpis.openHighSeverityCount > 0 ? 'warning' : 'neutral',
      accent: 'var(--chart-4)',
    },
    {
      label: 'Oldest Open',
      value: 2,
      suffix: ' hours',
      tone:
        oldestOpenDays !== null && oldestOpenDays >= 7 ? 'critical' : 'warning',
      accent: 'var(--chart-5)',
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Advisories</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 px-6">
              <Badge variant="outline">
                {advisorySummary.advisoriesSent24h.toLocaleString()} sent (24h)
              </Badge>
            </div>
            <ScrollArea className="h-[24rem] border-t sm:h-80">
              <div className="flex flex-col divide-y">
                {advisorySummary.recentAdvisories.length > 0 ? (
                  advisorySummary.recentAdvisories.map((advisory) => (
                    <article
                      key={advisory.id}
                      className="space-y-3 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Title
                          </p>
                          <h3 className="text-sm font-semibold leading-tight break-words">
                            {advisory.title}
                          </h3>
                        </div>
                        <div className="max-w-[7rem] shrink-0 text-right text-xs text-muted-foreground">
                          <p className="capitalize">
                            {advisory.channel.replace('_', ' ')}
                          </p>
                          <p>{formatDate(advisory.createdAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Message
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                          {advisory.message}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-muted-foreground sm:px-6">
                    No advisories posted yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Incident Pressure</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4 overflow-hidden">
          <div className="grid gap-3 sm:grid-cols-3">
            {pressureMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {metric.label}
                </div>
                <div className="mt-2 flex flex-wrap items-start gap-0.5 sm:items-baseline sm:gap-1">
                  <span className="flex flex-wrap gap-1 text-lg items-center font-semibold tabular-nums sm:text-xl">
                    {metric.value.toLocaleString()}
                    {metric.suffix ? (
                      <span className="ml-1 text-sm font-semibold sm:text-md">
                        {metric.suffix}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metric.tone === 'critical'
                      ? 'High pressure'
                      : metric.tone === 'warning'
                        ? 'Needs attention'
                        : 'Stable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3 sm:hidden">
            {pressureMetrics.map((metric) => {
              const maxMetricValue = Math.max(
                ...pressureMetrics.map((item) => item.value),
                1
              );
              const width = `${Math.max((metric.value / maxMetricValue) * 100, 8)}%`;

              return (
                <div key={`${metric.label}-mobile`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {metric.value.toLocaleString()}
                      {metric.suffix ?? ''}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width, backgroundColor: metric.accent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <ChartContainer
            config={pressureChartConfig}
            className="hidden h-56 w-full min-w-0 sm:block sm:h-64"
          >
            <BarChart
              data={pressureMetrics}
              margin={{ top: 12, right: 8, left: 0, bottom: isMobile ? 28 : 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={isMobile ? -18 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 52 : 30}
                tickMargin={isMobile ? 10 : 8}
                tick={{ fontSize: isMobile ? 11 : 12 }}
                tickFormatter={(value) =>
                  String(value)
                    .replace('High/Critical', 'Critical')
                    .replace('Incidents', '')
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" radius={10}>
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value) =>
                    typeof value === 'number'
                      ? value.toLocaleString()
                      : String(value ?? '')
                  }
                />
                {pressureMetrics.map((metric) => (
                  <Cell
                    key={metric.label}
                    className="dark:fill-white"
                    fill={metric.accent}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pressure metric</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Open Incidents</TableCell>
                  <TableCell>{openIncidentCount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>High/Critical Open</TableCell>
                  <TableCell>
                    {kpis.openHighSeverityCount.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Oldest Open</TableCell>
                  <TableCell>2 hours</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
