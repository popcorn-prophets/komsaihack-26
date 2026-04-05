import { connection } from 'next/server';

import { ExportPanel } from '@/components/control-center/export-panel';
import { requireRole } from '@/lib/auth/dal';
import {
  formatIncidentDateTimeLabel,
  formatIncidentLocationLabel,
  formatIncidentSeverityLabel,
  formatIncidentStatusLabel,
  formatIncidentTypeLabel,
  formatReporterNameLabel,
  formatReporterPlatformLabel,
  getIncidentExportData,
  getIncidentSeveritySummaryText,
  parseIncidentExportFilters,
} from '@/lib/incidents/export';
import { INCIDENT_EXPORT_ALLOWED_ROLES } from '@/lib/incidents/export-config';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    start?: string | string[];
    end?: string | string[];
  }>;
}) {
  await connection();
  await requireRole(INCIDENT_EXPORT_ALLOWED_ROLES);

  const params = await searchParams;
  const filterResult = parseIncidentExportFilters(params);

  const data = filterResult.success
    ? await getIncidentExportData(filterResult.filters)
    : null;
  const rangeLabel =
    filterResult.success && data ? data.dateRangeLabel : 'Invalid date range';
  const summary = data
    ? {
        total: data.summary.total,
        severityText: getIncidentSeveritySummaryText(data.summary),
      }
    : {
        total: 0,
        severityText: 'No filtered data available',
      };
  const previewRows =
    data?.rows.map((row) => ({
      id: row.id,
      incidentType: formatIncidentTypeLabel(row.incidentTypeName),
      severity: formatIncidentSeverityLabel(row.severity),
      status: formatIncidentStatusLabel(row.status),
      incidentTime: formatIncidentDateTimeLabel(row.incidentTime),
      reporter: `${formatReporterNameLabel(row.reporterName)} · ${formatReporterPlatformLabel(
        row.reporterPlatform
      )}`,
      location: formatIncidentLocationLabel(row),
    })) ?? [];

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      <ExportPanel
        initialStartDate={filterResult.input.start}
        initialEndDate={filterResult.input.end}
        validationError={filterResult.success ? null : filterResult.error}
        rangeLabel={rangeLabel}
        summary={summary}
        previewRows={previewRows}
      />
    </div>
  );
}
