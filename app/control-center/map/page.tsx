import {
  IncidentMarker,
  InteractiveMap,
} from '@/components/control-center/map/interactive-map';
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
  'id' | 'location_description' | 'severity' | 'status'
> & {
  longitude: number | null;
  latitude: number | null;
};

export default async function Page() {
  let data: IncidentMapRow[] | null = null;
  let error: unknown = null;

  try {
    const admin = createAdminClient();
    const adminResult = await admin
      .from('incidents_with_coords')
      .select(
        'id, location_description, severity, status, longitude, latitude'
      );
    data = adminResult.data;
    error = adminResult.error;
  } catch (adminError) {
    const supabase = await createClient();
    const userResult = await supabase
      // View returns computed longitude/latitude so we don't need to parse geography client-side.
      .from('incidents_with_coords')
      .select(
        'id, location_description, severity, status, longitude, latitude'
      );
    data = userResult.data;
    error = userResult.error;
    console.warn('Admin client unavailable for map incidents.', adminError);
  }

  if (error) {
    console.error('Failed to load incidents for map:', error);
  }

  const dbMarkers: IncidentMarker[] = (data ?? []).flatMap((incident) => {
    const longitude =
      typeof incident.longitude === 'number' ? incident.longitude : null;
    const latitude =
      typeof incident.latitude === 'number' ? incident.latitude : null;

    if (longitude === null || latitude === null) return [];

    const label =
      incident.location_description ??
      `${incident.severity.toUpperCase()} · ${incident.status}`;

    return [{ id: incident.id, longitude, latitude, label }];
  });

  return (
    <InteractiveMap
      markers={dbMarkers}
      destination={MIAGAO_MDRRMO_DESTINATION}
    />
  );
}
