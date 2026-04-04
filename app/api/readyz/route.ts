import { getReadinessResult } from '@/lib/health';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getReadinessResult();
  return NextResponse.json(
    {
      ready: result.ready,
      checks: result.checks,
    },
    { status: result.ready ? 200 : 503 }
  );
}

export async function HEAD() {
  const result = await getReadinessResult();
  return new Response(null, { status: result.ready ? 200 : 503 });
}
