'use client';

import type { Database } from '@/types/supabase';

export type IncidentSeverity = Database['public']['Enums']['incident_severity'];

export type IncidentMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label?: string | null;
  severity?: IncidentSeverity | null;
  status?: string | null;
  description?: string | null;
  incidentTime?: string | null;
};

export type DestinationMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label: string;
};

export type IncidentMapSceneProps = {
  markers: IncidentMarker[];
  destination: DestinationMarker;
  embedded?: boolean;
};
