'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/incidents/shared';
import { type Incident } from '@/lib/supabase/reports';
import { cn } from '@/lib/utils';
import {
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from '../../incident-badges';

interface IncidentButtonProps {
  incident: Incident;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

function formatIncidentTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function IncidentEntry({
  incident,
  isSelected = false,
  onClick,
}: IncidentButtonProps) {
  const incidentType = incident.incident_type_id || 'Unknown Type';
  const reportedBy = incident.reported_by || 'Unknown Reporter';
  const incidentSeverity: IncidentSeverity = INCIDENT_SEVERITIES.includes(
    incident.severity as IncidentSeverity
  )
    ? (incident.severity as IncidentSeverity)
    : 'low';
  const incidentStatus: IncidentStatus = INCIDENT_STATUSES.includes(
    incident.status as IncidentStatus
  )
    ? (incident.status as IncidentStatus)
    : 'new';

  const handleClick = () => onClick?.(incident.id);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(incident.id);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'min-w-0 w-full cursor-pointer gap-3 overflow-hidden py-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none hover:border-primary/40 hover:shadow-md',
        isSelected && 'border-primary bg-accent/30 ring-1 ring-primary/40'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
    >
      <CardHeader className="px-4 mb-0">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <CardTitle className="min-w-0 flex-1 mb-0 text-sm leading-tight wrap-anywhere">
            {incidentType}
          </CardTitle>
          <div className="shrink-0 flex flex-wrap items-center justify-end gap-1.5">
            <IncidentSeverityBadge severity={incidentSeverity} />
            <IncidentStatusBadge status={incidentStatus} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <CardDescription className="whitespace-normal text-xs wrap-anywhere">
            Reported by: {reportedBy}
          </CardDescription>
          <CardDescription className="text-xs">
            {formatIncidentTime(incident.incident_time)}
          </CardDescription>
          {incident.location_description && (
            <CardDescription className="whitespace-normal text-xs wrap-anywhere">
              Location: {incident.location_description}
            </CardDescription>
          )}
        </div>
      </CardContent>

      {incident.description && (
        <CardFooter className="px-4 pt-0">
          <p className="whitespace-normal text-xs text-foreground/80 wrap-anywhere">
            {incident.description}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default IncidentEntry;
