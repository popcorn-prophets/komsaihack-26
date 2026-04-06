'use client';

import {
  IconCalendarEvent,
  IconDatabaseExport,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFilter,
  IconReload,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ExportPreviewRow = {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  incidentTime: string;
  reporter: string;
  location: string;
};

function buildDownloadHref(
  format: 'csv' | 'pdf',
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams();

  params.set('format', format);

  if (startDate) {
    params.set('start', startDate);
  }

  if (endDate) {
    params.set('end', endDate);
  }

  return `/api/exports/incidents?${params.toString()}`;
}

export function ExportPanel({
  initialStartDate,
  initialEndDate,
  validationError,
  summary,
  rangeLabel,
  previewRows,
}: {
  initialStartDate: string;
  initialEndDate: string;
  validationError: string | null;
  summary: {
    total: number;
    severityText: string;
  };
  rangeLabel: string;
  previewRows: ExportPreviewRow[];
}) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const hasInvalidRange = Boolean(startDate && endDate && startDate > endDate);
  const clientValidationError = hasInvalidRange
    ? 'Start date cannot be later than end date.'
    : null;
  const activeError = clientValidationError ?? validationError;
  const csvHref = buildDownloadHref('csv', startDate, endDate);
  const pdfHref = buildDownloadHref('pdf', startDate, endDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="gap-1">
          <IconDatabaseExport />
          Incident export
        </Badge>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Export</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Export incident records for reporting and external sharing. The
            files include incident fields, readable incident type labels,
            reporter details, and simplified location text.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export filters</CardTitle>
          <CardDescription>
            Filter the export by incident date. Leave both fields blank to
            export all incidents.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            action="/control-center/export"
            method="get"
            className="flex flex-col gap-4"
          >
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="export-start">Start date</FieldLabel>
                <FieldContent>
                  <Input
                    id="export-start"
                    name="start"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <FieldDescription>
                    Include incidents from the start of this day.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="export-end">End date</FieldLabel>
                <FieldContent>
                  <Input
                    id="export-end"
                    name="end"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                  <FieldDescription>
                    Include incidents through the end of this day.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            <FieldError>{activeError}</FieldError>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={hasInvalidRange}>
                  <IconFilter data-icon="inline-start" />
                  Apply range
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/control-center/export">
                    <IconReload data-icon="inline-start" />
                    Clear
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={hasInvalidRange}
                  onClick={() => window.location.assign(csvHref)}
                >
                  <IconFileSpreadsheet data-icon="inline-start" />
                  Download CSV
                </Button>
                <Button
                  type="button"
                  disabled={hasInvalidRange}
                  onClick={() => window.location.assign(pdfHref)}
                >
                  <IconFileTypePdf data-icon="inline-start" />
                  Download PDF
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">
            Current range:{' '}
            <span className="font-medium text-foreground">{rangeLabel}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Included fields: incident type labels, severity, status, incident
            timestamps, descriptions, simplified location details, and reporter
            information.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtered incident preview</CardTitle>
          <CardDescription>
            {summary.total} incidents match the selected range. CSV and PDF
            downloads use this same filtered dataset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total incidents
              </div>
              <div className="mt-2 text-2xl font-semibold">{summary.total}</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Severity mix
              </div>
              <div className="mt-2 text-sm text-foreground">
                {summary.severityText}
              </div>
            </div>
          </div>

          {previewRows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Incident time</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1 whitespace-normal">
                        <span className="font-medium">{row.incidentType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.severity}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.incidentTime}</TableCell>
                    <TableCell>{row.reporter}</TableCell>
                    <TableCell className="whitespace-normal">
                      {row.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No incidents matched the selected incident date range.
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconCalendarEvent />
            Incident time is used for date-range filtering.
          </div>
          <div className="flex items-center gap-2">
            <IconDownload />
            Downloads reflect the same range shown above.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
