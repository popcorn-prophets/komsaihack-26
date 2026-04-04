import type { BotThread } from '@/lib/bot/types';
import { pointToString } from '@/lib/geo';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Point } from '@/types/geo';
import { Constants, type Enums } from '@/types/supabase';

type IncidentSeverity = Enums<'incident_severity'>;

const INCIDENT_SEVERITIES = Constants.public.Enums
  .incident_severity as readonly IncidentSeverity[];

export interface IncidentSubmissionPayload {
  thread: BotThread;
  incidentTypeName: string;
  severity: IncidentSeverity;
  description: string;
  location?: Point;
  locationDescription?: string;
}

export async function fetchIncidentTypeNames(): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('incident_types')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to load incident types:', error);
    throw new Error(
      'Incident types are currently unavailable. Please try again.'
    );
  }

  return data?.map((item) => item.name) ?? [];
}

export function isIncidentSeverity(value: string): value is IncidentSeverity {
  return INCIDENT_SEVERITIES.includes(value as IncidentSeverity);
}

export async function submitIncidentReport({
  thread,
  incidentTypeName,
  severity,
  description,
  location,
  locationDescription,
}: IncidentSubmissionPayload): Promise<void> {
  const supabase = createAdminClient();

  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select('id')
    .eq('thread_id', thread.id)
    .maybeSingle();

  if (residentError) {
    console.error(
      'Failed to resolve resident for incident report:',
      residentError
    );
    throw new Error('Failed to identify your account. Please try again.');
  }

  if (!resident) {
    throw new Error(
      'You need to complete onboarding before reporting incidents.'
    );
  }

  const { data: incidentType, error: incidentTypeError } = await supabase
    .from('incident_types')
    .select('id')
    .eq('name', incidentTypeName)
    .maybeSingle();

  if (incidentTypeError) {
    console.error('Failed to resolve incident type:', incidentTypeError);
    throw new Error('Failed to process incident type. Please try again.');
  }

  if (!incidentType) {
    throw new Error(
      'Selected incident type is no longer available. Please try again.'
    );
  }

  const locationWkt = location ? pointToString(location) : null;
  const normalizedLocationDescription =
    typeof locationDescription === 'string' &&
    locationDescription.trim().length > 0
      ? locationDescription.trim()
      : null;

  const { error: insertError } = await supabase.from('incidents').insert({
    reported_by: resident.id,
    incident_type_id: incidentType.id,
    severity,
    description,
    location: locationWkt,
    location_description: normalizedLocationDescription,
  });

  if (insertError) {
    console.error('Failed to insert incident report:', insertError);
    throw new Error('Failed to submit your report. Please try again later.');
  }
}
