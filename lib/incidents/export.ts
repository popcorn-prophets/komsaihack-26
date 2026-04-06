import 'server-only';

import { z } from 'zod';

import { formatDateTime } from '@/lib/date';
import {
  formatIncidentSeverityLabel,
  formatIncidentStatusLabel,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/incidents/shared';
import { createAdminClient } from '@/lib/supabase/admin';
import { type Enums, type Tables } from '@/types/supabase';

import {
  INCIDENT_EXPORT_TIMEZONE,
  INCIDENT_EXPORT_TIMEZONE_OFFSET,
} from './export-config';

type ResidentPlatform = Enums<'resident_platform'>;
type IncidentExportViewRow = Tables<'incidents_with_details'>;

const dateInputSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export type IncidentExportSearchParams = {
  start?: string | string[];
  end?: string | string[];
};

export type IncidentExportFilters = {
  startDate: string | null;
  endDate: string | null;
  incidentTimeFrom: string | null;
  incidentTimeTo: string | null;
};

export type IncidentExportFilterParseResult =
  | {
      success: true;
      filters: IncidentExportFilters;
      input: {
        start: string;
        end: string;
      };
    }
  | {
      success: false;
      error: string;
      input: {
        start: string;
        end: string;
      };
    };

export type IncidentExportRow = {
  id: string;
  incidentTypeName: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  incidentTime: string;
  createdAt: string;
  description: string | null;
  locationDescription: string | null;
  latitude: number | null;
  longitude: number | null;
  reporterName: string | null;
  reporterPlatform: ResidentPlatform | null;
};

export type IncidentExportSummary = {
  total: number;
  severityCounts: Array<{
    value: IncidentSeverity;
    label: string;
    count: number;
  }>;
  statusCounts: Array<{
    value: IncidentStatus;
    label: string;
    count: number;
  }>;
};

export type IncidentExportDataset = {
  rows: IncidentExportRow[];
  summary: IncidentExportSummary;
  startDate: string | null;
  endDate: string | null;
  dateRangeLabel: string;
};

export { formatIncidentSeverityLabel, formatIncidentStatusLabel };

function getFirstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }

  return value?.trim() ?? '';
}

function isValidDateInput(value: string) {
  if (!dateInputSchema.safeParse(value).success) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getIncidentRangeBoundary(value: string, boundary: 'start' | 'end') {
  const time = boundary === 'start' ? 'T00:00:00.000' : 'T23:59:59.999';

  return `${value}${time}${INCIDENT_EXPORT_TIMEZONE_OFFSET}`;
}

function normalizeViewRow(
  row: IncidentExportViewRow
): IncidentExportRow | null {
  if (
    !row.id ||
    !row.incident_time ||
    !row.created_at ||
    !row.severity ||
    !row.status
  ) {
    return null;
  }

  return {
    id: row.id,
    incidentTypeName: row.incident_type_name?.trim() || null,
    severity: row.severity,
    status: row.status,
    incidentTime: row.incident_time,
    createdAt: row.created_at,
    description: row.description?.trim() || null,
    locationDescription: row.location_description?.trim() || null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    reporterName: row.reporter_name?.trim() || null,
    reporterPlatform: row.reporter_platform ?? null,
  };
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatDateInputLabel(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeZone: INCIDENT_EXPORT_TIMEZONE,
  }).format(
    new Date(`${value}T00:00:00.000${INCIDENT_EXPORT_TIMEZONE_OFFSET}`)
  );
}

function formatTimestampLabel(value: string) {
  return formatDateTime(value, 'en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: INCIDENT_EXPORT_TIMEZONE,
  });
}

function formatNullableText(value: string | null, fallback: string) {
  return value?.trim() || fallback;
}

export function formatReporterPlatformLabel(value: ResidentPlatform | null) {
  if (value === 'telegram') {
    return 'Telegram';
  }

  if (value === 'messenger') {
    return 'Messenger';
  }

  if (value === 'webchat') {
    return 'Web Chat';
  }

  return 'Unknown platform';
}

export function formatIncidentTypeLabel(value: string | null) {
  return formatNullableText(value, 'Unknown incident type');
}

export function formatReporterNameLabel(value: string | null) {
  return formatNullableText(value, 'Unknown resident');
}

export function formatCoordinatesLabel(
  latitude: number | null,
  longitude: number | null
) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'Unavailable';
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

const REGION_SEGMENT_PATTERNS = [
  /region/i,
  /visayas/i,
  /luzon/i,
  /mindanao/i,
  /mimaropa/i,
  /calabarzon/i,
  /bangsamoro/i,
  /barmm/i,
  /soccsksargen/i,
  /caraga/i,
  /^ncr$/i,
  /^car$/i,
];

function cleanLocationSegment(segment: string) {
  return segment
    .replace(/\b\d{4,6}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[,.\-\s]+|[,.\-\s]+$/g, '');
}

function isRegionSegment(segment: string) {
  return REGION_SEGMENT_PATTERNS.some((pattern) => pattern.test(segment));
}

function dedupeLocationSegments(segments: string[]) {
  const unique: string[] = [];

  for (const segment of segments) {
    if (
      !unique.some(
        (existing) =>
          existing.localeCompare(segment, 'en', { sensitivity: 'base' }) === 0
      )
    ) {
      unique.push(segment);
    }
  }

  return unique;
}

export function simplifyIncidentLocationDescription(value: string | null) {
  if (!value) {
    return null;
  }

  const segments = value.split(',').map(cleanLocationSegment).filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const country = segments.at(-1) ?? null;
  const coreSegments = segments
    .slice(0, -1)
    .filter((segment) => !isRegionSegment(segment));

  const street = coreSegments[0] ?? null;
  const city = coreSegments.length >= 3 ? (coreSegments.at(-2) ?? null) : null;
  const province =
    coreSegments.length >= 2 ? (coreSegments.at(-1) ?? null) : null;

  const simplified = dedupeLocationSegments(
    [street, city, province, country].filter((segment): segment is string =>
      Boolean(segment)
    )
  );

  return simplified.length > 0 ? simplified.join(', ') : null;
}

export function formatIncidentLocationLabel(row: {
  locationDescription: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  return (
    simplifyIncidentLocationDescription(row.locationDescription) ??
    'Unavailable'
  );
}

export function formatIncidentExportDateRangeLabel(
  startDate: string | null,
  endDate: string | null
) {
  if (startDate && endDate) {
    return `${formatDateInputLabel(startDate)} to ${formatDateInputLabel(
      endDate
    )}`;
  }

  if (startDate) {
    return `From ${formatDateInputLabel(startDate)}`;
  }

  if (endDate) {
    return `Until ${formatDateInputLabel(endDate)}`;
  }

  return 'All incidents';
}

function buildSummary(rows: IncidentExportRow[]): IncidentExportSummary {
  return {
    total: rows.length,
    severityCounts: INCIDENT_SEVERITIES.map((value) => ({
      value,
      label: formatIncidentSeverityLabel(value),
      count: rows.filter((row) => row.severity === value).length,
    })),
    statusCounts: INCIDENT_STATUSES.map((value) => ({
      value,
      label: formatIncidentStatusLabel(value),
      count: rows.filter((row) => row.status === value).length,
    })),
  };
}

function getTimestampToken(value: Date) {
  return value
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function buildIncidentExportFilename(
  format: 'csv' | 'pdf',
  filters: Pick<IncidentExportFilters, 'startDate' | 'endDate'>,
  generatedAt: Date
) {
  const rangeToken =
    filters.startDate || filters.endDate
      ? `${filters.startDate ?? 'start'}-to-${filters.endDate ?? 'end'}`
      : 'all-time';

  return `incidents-export-${rangeToken}-${getTimestampToken(generatedAt)}.${format}`;
}

export function parseIncidentExportFilters(
  params: IncidentExportSearchParams
): IncidentExportFilterParseResult {
  const input = {
    start: getFirstString(params.start),
    end: getFirstString(params.end),
  };

  const startDate = input.start || null;
  const endDate = input.end || null;

  if (startDate && !isValidDateInput(startDate)) {
    return {
      success: false,
      error: 'Start date must use a valid YYYY-MM-DD value.',
      input,
    };
  }

  if (endDate && !isValidDateInput(endDate)) {
    return {
      success: false,
      error: 'End date must use a valid YYYY-MM-DD value.',
      input,
    };
  }

  if (startDate && endDate && startDate > endDate) {
    return {
      success: false,
      error: 'Start date cannot be later than end date.',
      input,
    };
  }

  return {
    success: true,
    input,
    filters: {
      startDate,
      endDate,
      incidentTimeFrom: startDate
        ? getIncidentRangeBoundary(startDate, 'start')
        : null,
      incidentTimeTo: endDate ? getIncidentRangeBoundary(endDate, 'end') : null,
    },
  };
}

export async function getIncidentExportData(
  filters: IncidentExportFilters
): Promise<IncidentExportDataset> {
  const supabase = createAdminClient();
  let query = supabase
    .from('incidents_with_details')
    .select(
      'id, incident_type_name, severity, status, incident_time, created_at, description, location_description, latitude, longitude, reporter_name, reporter_platform'
    )
    .order('incident_time', { ascending: false });

  if (filters.incidentTimeFrom) {
    query = query.gte('incident_time', filters.incidentTimeFrom);
  }

  if (filters.incidentTimeTo) {
    query = query.lte('incident_time', filters.incidentTimeTo);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as IncidentExportViewRow[])
    .map(normalizeViewRow)
    .filter((row): row is IncidentExportRow => Boolean(row));

  return {
    rows,
    summary: buildSummary(rows),
    startDate: filters.startDate,
    endDate: filters.endDate,
    dateRangeLabel: formatIncidentExportDateRangeLabel(
      filters.startDate,
      filters.endDate
    ),
  };
}

export function serializeIncidentExportCsv(rows: IncidentExportRow[]) {
  const headers = [
    'Incident Type',
    'Severity',
    'Status',
    'Incident Time',
    'Created At',
    'Description',
    'Location',
    'Reporter Name',
    'Reporter Platform',
  ];

  const body = rows.map((row) =>
    [
      formatIncidentTypeLabel(row.incidentTypeName),
      formatIncidentSeverityLabel(row.severity),
      formatIncidentStatusLabel(row.status),
      row.incidentTime,
      row.createdAt,
      row.description ?? '',
      simplifyIncidentLocationDescription(row.locationDescription) ?? '',
      row.reporterName ?? '',
      row.reporterPlatform
        ? formatReporterPlatformLabel(row.reporterPlatform)
        : '',
    ]
      .map((value) => escapeCsvValue(value))
      .join(',')
  );

  return `\uFEFF${[headers.map(escapeCsvValue).join(','), ...body].join('\n')}`;
}

export function getIncidentStatusSummaryText(summary: IncidentExportSummary) {
  return summary.statusCounts
    .map((item) => `${item.label}: ${item.count}`)
    .join(' · ');
}

export function getIncidentSeveritySummaryText(summary: IncidentExportSummary) {
  return summary.severityCounts
    .map((item) => `${item.label}: ${item.count}`)
    .join(' · ');
}

export function formatIncidentDateTimeLabel(value: string) {
  return formatTimestampLabel(value);
}
