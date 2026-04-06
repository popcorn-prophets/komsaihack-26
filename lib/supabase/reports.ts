import { createClient } from '@/lib/supabase/client';
import {
  toIncidentBoardEntry,
  type IncidentBoardEntry,
} from '@/lib/incidents/shared';
import type { Tables } from '@/types/supabase';

// Initialize Supabase client
const supabase = createClient();

// Type definition for incident
export interface Incident {
  id: string;
  reported_by: string;
  incident_type_id: string;
  location: string;
  location_description: string | null;
  severity: string;
  description: string | null;
  status: string;
  incident_time: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  incident_name?: string;
}

export async function fetchAllIncidents(): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select(
        `id,
        reported_by,
        incident_type_id,
        location,
        location_description,
        severity,
        description,
        status,
        incident_time,
        created_at,
        updated_at,
        residents!reported_by(name),
        incident_types!incident_type_id(name)`
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents:', error);
      return null;
    }

    // Transform the data to flatten the relationships
    const transformedData = data.map((incident) => ({
      id: incident.id,
      incident_type_id: incident.incident_type_id,
      reported_by: incident.reported_by,
      location: incident.location,
      location_description: incident.location_description,
      severity: incident.severity,
      description: incident.description,
      status: incident.status,
      incident_time: incident.incident_time,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
      reporter_name: (incident.residents as unknown as { name: string })?.name,
      incident_name: (incident.incident_types as unknown as { name: string })
        ?.name,
    }));

    return transformedData as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

interface IncidentWithDetailsRow {
  id: string | null;
  incident_type_id: string | null;
  incident_type_name: string | null;
  severity: string | null;
  status: string | null;
  incident_time: string | null;
  created_at: string | null;
  updated_at: string | null;
  description: string | null;
  location_description: string | null;
  longitude: number | null;
  latitude: number | null;
  reported_by: string | null;
  reporter_name: string | null;
}

function mapDetailsRowToIncident(row: IncidentWithDetailsRow): Incident | null {
  if (
    !row.id ||
    !row.severity ||
    !row.status ||
    !row.incident_time ||
    !row.created_at ||
    !row.updated_at
  ) {
    return null;
  }

  return {
    id: row.id,
    reported_by: row.reporter_name || row.reported_by || 'Unknown Reporter',
    incident_type_id:
      row.incident_type_name || row.incident_type_id || 'Unknown Type',
    location:
      row.latitude !== null && row.longitude !== null
        ? `${row.latitude}, ${row.longitude}`
        : '',
    location_description: row.location_description,
    severity: row.severity,
    description: row.description,
    status: row.status,
    incident_time: row.incident_time,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchIncidents(
  sortBy: string = 'incident_time',
  sortOrder: string = 'descending',
  count: number = 50
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents_with_details')
      .select(
        `id,
        reported_by,
        incident_type_id,
        incident_type_name,
        reporter_name,
        latitude,
        longitude,
        location_description,
        severity,
        description,
        status,
        incident_time,
        created_at,
        updated_at`
      )
      .neq('status', 'resolved')
      .neq('status', 'dismissed')
      .order(sortBy, { ascending: sortOrder === 'ascending' ? true : false })
      .limit(count);

    if (error) {
      console.error('Error fetching incidents:', error);
      return null;
    }

    const transformedData = (data as IncidentWithDetailsRow[])
      .map(mapDetailsRowToIncident)
      .filter((incident): incident is Incident => incident !== null);

    return transformedData as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Fetch incident by ID
export async function fetchIncidentById(
  id: string | null
): Promise<Incident | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return null;
    }

    return data as Incident;
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

export async function fetchIncidentTypeName(
  id: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('incident_types')
      .select('name')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return null;
    }

    return data.name;
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

export async function fetchIncidentTypeID(
  name: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('incident_types')
      .select('id')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

export async function fetchResidentName(id: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('name')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      return null;
    }

    return data.name;
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

export async function fetchIncidentBoardEntries(): Promise<
  IncidentBoardEntry[]
> {
  try {
    const { data, error } = await supabase
      .from('incidents_with_details')
      .select(
        'id, reported_by, incident_type_name, severity, status, incident_time, location_description, description, reporter_name'
      )
      .order('incident_time', { ascending: false });

    if (error) {
      console.error('Error fetching board incidents:', error);
      return [];
    }

    return ((data ?? []) as Tables<'incidents_with_details'>[])
      .map((incident) => toIncidentBoardEntry(incident))
      .filter((incident): incident is IncidentBoardEntry => incident !== null);
  } catch (error) {
    console.error('Board fetch error:', error);
    return [];
  }
}

export async function updateIncidentEntry(incident: Incident) {
  try {
    const { error } = await supabase
      .from('incidents')
      .update({
        location_description: incident.location_description,
        severity: incident.severity,
        description: incident.description,
        status: incident.status,
      })
      .eq('id', incident.id);

    if (error) {
      console.error('Error posting incident:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database fetch error:', error);
    return false;
  }
}
