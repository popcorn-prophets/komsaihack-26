import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/dal';
import { canAccessIncidentExport } from '@/lib/incidents/export-config';
import {
  buildIncidentExportFilename,
  getIncidentExportData,
  parseIncidentExportFilters,
  serializeIncidentExportCsv,
} from '@/lib/incidents/export';
import { renderIncidentExportPdf } from '@/lib/incidents/export-pdf';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  const viewer = await getCurrentUser();

  if (!viewer) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!canAccessIncidentExport(viewer)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  if (format !== 'csv' && format !== 'pdf') {
    return NextResponse.json(
      { error: 'Format must be either csv or pdf.' },
      { status: 400 }
    );
  }

  const filterResult = parseIncidentExportFilters({
    start: url.searchParams.get('start') ?? undefined,
    end: url.searchParams.get('end') ?? undefined,
  });

  if (!filterResult.success) {
    return NextResponse.json({ error: filterResult.error }, { status: 400 });
  }

  const data = await getIncidentExportData(filterResult.filters);
  const generatedAt = new Date();
  const filename = buildIncidentExportFilename(
    format,
    filterResult.filters,
    generatedAt
  );

  if (format === 'csv') {
    return new Response(serializeIncidentExportCsv(data.rows), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'text/csv; charset=utf-8',
      },
    });
  }

  const buffer = await renderIncidentExportPdf(data, generatedAt);
  const pdfBytes = new Uint8Array(buffer);

  return new Response(pdfBytes, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/pdf',
    },
  });
}
