import { getLivenessPayload } from '@/lib/health';
import { NextResponse } from 'next/server';

/**
 * Liveness probe — process is up. GET returns JSON; HEAD for load balancers.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 * @see https://nextjs.org/docs/app/getting-started/route-handlers
 */
export async function GET() {
  return NextResponse.json(await getLivenessPayload());
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
