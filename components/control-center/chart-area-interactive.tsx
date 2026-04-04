'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

export const description = 'Incident reporting and advisory trends';

const chartData = [
  { date: '2024-04-01', incidents: 12, advisories: 3 },
  { date: '2024-04-02', incidents: 8, advisories: 2 },
  { date: '2024-04-03', incidents: 15, advisories: 5 },
  { date: '2024-04-04', incidents: 20, advisories: 7 },
  { date: '2024-04-05', incidents: 18, advisories: 6 },
  { date: '2024-04-06', incidents: 22, advisories: 8 },
  { date: '2024-04-07', incidents: 17, advisories: 4 },
  { date: '2024-04-08', incidents: 25, advisories: 9 },
  { date: '2024-04-09', incidents: 9, advisories: 2 },
  { date: '2024-04-10', incidents: 13, advisories: 5 },
];

const chartConfig = {
  incidents: { label: 'Incidents Reported', color: 'var(--primary)' },
  advisories: { label: 'Advisories Sent', color: 'var(--primary)' },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');

  React.useEffect(() => {
    if (isMobile) setTimeRange('7d');
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date('2024-06-30');
    const daysToSubtract =
      timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Incident Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Last{' '}
            {timeRange === '90d'
              ? '3 months'
              : timeRange === '30d'
                ? '30 days'
                : '7 days'}
          </span>
          <span className="@[540px]/card:hidden">
            Last{' '}
            {timeRange === '90d'
              ? '3 months'
              : timeRange === '30d'
                ? '30 days'
                : '7 days'}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAdvisories" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="advisories"
              type="natural"
              fill="url(#fillAdvisories)"
              stroke="var(--primary)"
              stackId="a"
            />
            <Area
              dataKey="incidents"
              type="natural"
              fill="url(#fillIncidents)"
              stroke="var(--primary)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
