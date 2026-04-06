import { Constants, type Enums, type Tables } from '@/types/supabase';

export type IncidentSeverity = Enums<'incident_severity'>;
export type IncidentStatus = Enums<'incident_status'>;

export type IncidentBoardEntry = {
  id: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  incidentTypeName: string;
  reporterName: string;
  incidentTime: string;
  locationDescription: string | null;
  description: string | null;
};

export const INCIDENT_SEVERITIES = Constants.public.Enums
  .incident_severity as readonly IncidentSeverity[];
export const INCIDENT_STATUSES = Constants.public.Enums
  .incident_status as readonly IncidentStatus[];
export const TERMINAL_INCIDENT_STATUSES = [
  'resolved',
  'dismissed',
] as const satisfies readonly IncidentStatus[];

export function formatIncidentSeverityLabel(value: IncidentSeverity) {
  switch (value) {
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      return value;
  }
}

export function formatIncidentStatusLabel(value: IncidentStatus) {
  switch (value) {
    case 'new':
      return 'New';
    case 'validated':
      return 'Validated';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'dismissed':
      return 'Dismissed';
    default:
      return value;
  }
}

export function isTerminalIncidentStatus(value: IncidentStatus) {
  return (TERMINAL_INCIDENT_STATUSES as readonly IncidentStatus[]).includes(
    value
  );
}

export function toIncidentBoardEntry(
  row: Tables<'incidents_with_details'>
): IncidentBoardEntry | null {
  if (!row.id || !row.status || !row.severity || !row.incident_time) {
    return null;
  }

  return {
    id: row.id,
    status: row.status,
    severity: row.severity,
    incidentTypeName: row.incident_type_name?.trim() || 'Unknown incident',
    reporterName:
      row.reporter_name?.trim() ||
      row.reported_by?.trim() ||
      'Unknown reporter',
    incidentTime: row.incident_time,
    locationDescription: row.location_description?.trim() || null,
    description: row.description?.trim() || null,
  };
}
