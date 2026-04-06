import { IncidentMapSceneShell } from '@/components/control-center/map/incident-map-scene-shell';
import type { IncidentMarker } from '@/components/control-center/map/incident-map-scene';
import { toPoint } from '@/lib/geo';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/supabase';

const MIAGAO_MDRRMO_DESTINATION = {
  id: 'miagao-mdrrmo-office',
  longitude: 122.23505,
  latitude: 10.64078,
  label: 'MDRRMO Office, Miagao',
};

type IncidentMapRow = Pick<
  Tables<'incidents'>,
  | 'id'
  | 'description'
  | 'incident_time'
  | 'location'
  | 'location_description'
  | 'severity'
  | 'status'
>;

function toCoordinates(location: IncidentMapRow['location']) {
  const point = toPoint(location);
  if (point) {
    const [longitude, latitude] = point.coordinates;
    return { longitude, latitude };
  }

  if (typeof location === 'string') {
    const match = location.match(
      /^POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i
    );

    if (match) {
      return {
        longitude: Number(match[1]),
        latitude: Number(match[2]),
      };
    }

    const ewkbPattern = /^[0-9a-f]+$/i;
    if (ewkbPattern.test(location) && location.length >= 42) {
      try {
        const buffer = Buffer.from(location, 'hex');
        const byteOrder = buffer.readUInt8(0);
        const readUInt32 =
          byteOrder === 1
            ? (offset: number) => buffer.readUInt32LE(offset)
            : (offset: number) => buffer.readUInt32BE(offset);
        const readDouble =
          byteOrder === 1
            ? (offset: number) => buffer.readDoubleLE(offset)
            : (offset: number) => buffer.readDoubleBE(offset);

        const type = readUInt32(1);
        const hasSrid = (type & 0x20000000) !== 0;
        const geometryType = type & 0xff;

        if (geometryType === 1) {
          const coordinateOffset = hasSrid ? 9 : 5;

          return {
            longitude: readDouble(coordinateOffset),
            latitude: readDouble(coordinateOffset + 8),
          };
        }
      } catch {
        // ignore parse failure and fall through to null coordinates
      }
    }
  }

  return { longitude: null, latitude: null };
}

export default async function Page() {
  let data: IncidentMapRow[] | null = null;
  let error: unknown = null;

  try {
    const admin = createAdminClient();
    const adminResult = await admin
      .from('incidents')
      .select(
        'id, description, incident_time, location, location_description, severity, status'
      )
      .neq('status', 'resolved') //This is the not equal
      .neq('status', 'dismissed');
    data = adminResult.data;
    error = adminResult.error;
  } catch (adminError) {
    const supabase = await createClient();
    const userResult = await supabase
      .from('incidents')
      .select(
        'id, description, incident_time, location, location_description, severity, status'
      )
      .neq('status', 'resolved')
      .neq('status', 'dismissed');
    data = userResult.data;
    error = userResult.error;
    console.warn('Admin client unavailable for map incidents.', adminError);
  }

  if (error) {
    console.error('Failed to load incidents for map:', error);
  }

  const dbMarkers: IncidentMarker[] = (data ?? []).flatMap((incident) => {
    const { longitude, latitude } = toCoordinates(incident.location);

    if (longitude === null || latitude === null) return [];

    const label =
      incident.location_description ??
      `${incident.severity.toUpperCase()} · ${incident.status}`;

    return [
      {
        id: incident.id,
        longitude,
        latitude,
        label,
        severity: incident.severity,
        status: incident.status,
        description: incident.description ?? null,
        incidentTime: incident.incident_time ?? null,
      },
    ];
  });

  return (
    <IncidentMapSceneShell
      markers={dbMarkers}
      destination={MIAGAO_MDRRMO_DESTINATION}
    />
  );
}
