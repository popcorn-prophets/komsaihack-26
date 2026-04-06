import { translate } from './translator';
import type { ResidentLocale } from './types';

const INCIDENT_SEVERITY_KEY_MAP = {
  low: 'incident.severity.low',
  medium: 'incident.severity.moderate',
  high: 'incident.severity.high',
  critical: 'incident.severity.critical',
} as const;

const INCIDENT_STATUS_KEY_MAP = {
  new: 'incident.status.new',
  validated: 'incident.status.validated',
  in_progress: 'incident.status.in_progress',
  resolved: 'incident.status.resolved',
  dismissed: 'incident.status.dismissed',
} as const;

/**
 * Localize incident severity values in a single reusable place.
 */
export function localizeIncidentSeverity(
  severity: string,
  locale: ResidentLocale
): string {
  const key =
    INCIDENT_SEVERITY_KEY_MAP[
      severity as keyof typeof INCIDENT_SEVERITY_KEY_MAP
    ];

  if (!key) {
    return `${severity.charAt(0).toUpperCase()}${severity.slice(1)}`;
  }

  return translate(key, locale);
}

/**
 * Localize incident status values in a single reusable place.
 */
export function localizeIncidentStatus(
  status: string,
  locale: ResidentLocale
): string {
  const key =
    INCIDENT_STATUS_KEY_MAP[status as keyof typeof INCIDENT_STATUS_KEY_MAP];

  if (!key) {
    return `${status.charAt(0).toUpperCase()}${status.slice(1).replace('_', ' ')}`;
  }

  return translate(key, locale);
}
