import { NextRequest, NextResponse } from 'next/server';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

function toNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startLng = toNumber(searchParams.get('startLng'));
  const startLat = toNumber(searchParams.get('startLat'));
  const endLng = toNumber(searchParams.get('endLng'));
  const endLat = toNumber(searchParams.get('endLat'));

  if (
    startLng === null ||
    startLat === null ||
    endLng === null ||
    endLat === null
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid direction coordinates.' },
      { status: 400 }
    );
  }

  const directionsUrl =
    `${OSRM_BASE_URL}/${startLng},${startLat};${endLng},${endLat}` +
    '?overview=full&geometries=geojson&steps=false';

  try {
    const response = await fetch(directionsUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch road directions.' },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      routes?: Array<{
        geometry?: { coordinates?: [number, number][] };
        distance?: number;
        duration?: number;
      }>;
    };

    const route = payload.routes?.[0];
    const coordinates = route?.geometry?.coordinates;

    if (!coordinates || coordinates.length < 2) {
      return NextResponse.json(
        { error: 'No drivable route found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      coordinates,
      distanceMeters: route.distance ?? null,
      durationSeconds: route.duration ?? null,
    });
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Directions request failed.' },
      { status: 500 }
    );
  }
}
