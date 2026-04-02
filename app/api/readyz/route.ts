import { getReadinessResult } from '@/lib/health';
import { NextResponse } from 'next/server';

/**
 * Readiness probe — config + Supabase Auth health. 503 when not ready.
 * @see https://nextjs.org/docs/app/api-reference/functions/next-response
 */
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
