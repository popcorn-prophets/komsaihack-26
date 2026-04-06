'use client';

import { Badge } from '@/components/ui/badge';
import {
  formatIncidentSeverityLabel,
  formatIncidentStatusLabel,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/incidents/shared';
import { cn } from '@/lib/utils';

export const INCIDENT_STATUS_DOT_CLASS: Record<IncidentStatus, string> = {
  new: 'bg-chart-4',
  validated: 'bg-chart-2',
  in_progress: 'bg-chart-1',
  resolved: 'bg-chart-5',
  dismissed: 'bg-destructive',
};

export const INCIDENT_SEVERITY_DOT_CLASS: Record<IncidentSeverity, string> = {
  low: 'bg-muted-foreground',
  moderate: 'bg-chart-4',
  high: 'bg-chart-1',
  critical: 'bg-destructive',
};

export const INCIDENT_STATUS_BADGE_CLASS: Record<IncidentStatus, string> = {
  new: 'border-chart-4/30 bg-chart-4/10 text-foreground',
  validated: 'border-chart-2/30 bg-chart-2/10 text-foreground',
  in_progress: 'border-chart-1/30 bg-chart-1/10 text-foreground',
  resolved: 'border-chart-5/30 bg-chart-5/10 text-foreground',
  dismissed: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border', INCIDENT_STATUS_BADGE_CLASS[status])}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          INCIDENT_STATUS_DOT_CLASS[status]
        )}
      />
      {formatIncidentStatusLabel(status)}
    </Badge>
  );
}

export function IncidentSeverityBadge({
  severity,
}: {
  severity: IncidentSeverity;
}) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={cn(
          'size-1.5 rounded-full',
          INCIDENT_SEVERITY_DOT_CLASS[severity]
        )}
      />
      {formatIncidentSeverityLabel(severity)}
    </Badge>
  );
}
