import { getLivenessPayload } from '@/lib/health';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(await getLivenessPayload());
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
