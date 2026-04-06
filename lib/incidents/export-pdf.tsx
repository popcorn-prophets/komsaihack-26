import 'server-only';

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';

import { formatDateTime } from '@/lib/date';

import {
  formatIncidentDateTimeLabel,
  formatIncidentExportDateRangeLabel,
  formatIncidentLocationLabel,
  formatIncidentSeverityLabel,
  formatIncidentTypeLabel,
  formatReporterNameLabel,
  formatReporterPlatformLabel,
  type IncidentExportDataset,
} from './export';
import { INCIDENT_EXPORT_TIMEZONE } from './export-config';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 42,
    paddingHorizontal: 28,
    fontSize: 9,
    color: '#111827',
    lineHeight: '145%',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  badge: {
    width: 112,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    color: '#075985',
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerCopy: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: '120%',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: '145%',
    maxWidth: '82%',
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metadataCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  metadataLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#475569',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 11,
    fontWeight: 600,
  },
  summarySection: {
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  summaryText: {
    color: '#374151',
    marginBottom: 3,
  },
  tableSection: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
  },
  tableHeaderCell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 8.5,
  },
  dateColumn: {
    width: '16%',
  },
  incidentColumn: {
    width: '20%',
  },
  reporterColumn: {
    width: '22%',
  },
  locationColumn: {
    width: '18%',
  },
  detailsColumn: {
    width: '24%',
  },
  cellTitle: {
    fontWeight: 700,
    marginBottom: 2,
  },
  subtle: {
    color: '#4b5563',
  },
  pageNumber: {
    position: 'absolute',
    right: 28,
    bottom: 16,
    fontSize: 8,
    color: '#6b7280',
  },
  emptyState: {
    padding: 14,
    color: '#4b5563',
  },
});

function IncidentExportPdfDocument({
  dataset,
  generatedAt,
}: {
  dataset: IncidentExportDataset;
  generatedAt: string;
}) {
  const generatedAtLabel = formatDateTime(generatedAt, 'en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: INCIDENT_EXPORT_TIMEZONE,
  });
  const rangeLabel = formatIncidentExportDateRangeLabel(
    dataset.startDate,
    dataset.endDate
  );

  return (
    <Document title="Incident Export Report" author="Project HERMES">
      <Page size="A4" style={styles.page}>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />

        <View style={styles.header}>
          <Text style={styles.badge}>DRRMO Export</Text>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Incident Export Report</Text>
            <Text style={styles.subtitle}>
              Prepared for reporting and external data sharing from Project
              HERMES.
            </Text>
          </View>

          <View style={styles.metadataRow}>
            <View style={styles.metadataCard}>
              <Text style={styles.metadataLabel}>Date range</Text>
              <Text style={styles.metadataValue}>{rangeLabel}</Text>
            </View>
            <View style={styles.metadataCard}>
              <Text style={styles.metadataLabel}>Generated at</Text>
              <Text style={styles.metadataValue}>{generatedAtLabel}</Text>
            </View>
            <View style={styles.metadataCard}>
              <Text style={styles.metadataLabel}>Total incidents</Text>
              <Text style={styles.metadataValue}>
                {dataset.summary.total.toString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            Severity breakdown:{' '}
            {dataset.summary.severityCounts
              .map((item) => `${item.label} ${item.count}`)
              .join(' · ')}
          </Text>
        </View>

        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.dateColumn]}>
              Date
            </Text>
            <Text style={[styles.tableHeaderCell, styles.incidentColumn]}>
              Incident
            </Text>
            <Text style={[styles.tableHeaderCell, styles.reporterColumn]}>
              Reporter
            </Text>
            <Text style={[styles.tableHeaderCell, styles.locationColumn]}>
              Location
            </Text>
            <Text style={[styles.tableHeaderCell, styles.detailsColumn]}>
              Details
            </Text>
          </View>

          {dataset.rows.length > 0 ? (
            dataset.rows.map((row) => (
              <View key={row.id} style={styles.row} wrap={false}>
                <View style={[styles.cell, styles.dateColumn]}>
                  <Text style={styles.cellTitle}>
                    {formatIncidentDateTimeLabel(row.incidentTime)}
                  </Text>
                  <Text style={styles.subtle}>
                    Created {formatIncidentDateTimeLabel(row.createdAt)}
                  </Text>
                </View>

                <View style={[styles.cell, styles.incidentColumn]}>
                  <Text style={styles.cellTitle}>
                    {formatIncidentTypeLabel(row.incidentTypeName)}
                  </Text>
                  <Text>{formatIncidentSeverityLabel(row.severity)}</Text>
                </View>

                <View style={[styles.cell, styles.reporterColumn]}>
                  <Text style={styles.cellTitle}>
                    {formatReporterNameLabel(row.reporterName)}
                  </Text>
                  <Text>
                    {formatReporterPlatformLabel(row.reporterPlatform)}
                  </Text>
                </View>

                <View style={[styles.cell, styles.locationColumn]}>
                  <Text style={styles.cellTitle}>
                    {formatIncidentLocationLabel(row)}
                  </Text>
                </View>

                <View style={[styles.cell, styles.detailsColumn]}>
                  <Text style={styles.cellTitle}>Description</Text>
                  <Text>{row.description ?? 'No description provided.'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>
              No incidents matched the selected incident date range.
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function renderIncidentExportPdf(
  dataset: IncidentExportDataset,
  generatedAt: Date
) {
  return renderToBuffer(
    <IncidentExportPdfDocument
      dataset={dataset}
      generatedAt={generatedAt.toISOString()}
    />
  );
}
