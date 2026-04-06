import { translate } from './translator';
import type { ResidentLocale } from './types';

const INCIDENT_SEVERITY_KEY_MAP = {
  low: 'incident.severity.low',
  medium: 'incident.severity.moderate',
  high: 'incident.severity.high',
  critical: 'incident.severity.critical',
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
