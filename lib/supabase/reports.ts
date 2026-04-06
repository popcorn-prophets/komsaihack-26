import { createClient } from '@/lib/supabase/client';

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
}

export async function fetchIncidents(
  sortBy: string = 'incident_time',
  sortOrder: string = 'descending',
  count: number = 50
): Promise<Incident[] | null> {
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
        residents (name),
        incident_types (name)`
      )
      .neq('status', 'resolved')
      .neq('status', 'dismissed')
      .order(sortBy, { ascending: sortOrder === 'ascending' ? true : false })
      .limit(count);

    if (error) {
      console.error('Error fetching incidents:', error);
      return null;
    }

    // Transform the data to flatten the relationships
    const transformedData = data.map((incident) => ({
      id: incident.id,
      reported_by: incident.residents?.[0]?.name || incident.reported_by,
      incident_type_id:
        incident.incident_types?.[0]?.name || incident.incident_type_id,
      location: incident.location,
      location_description: incident.location_description,
      severity: incident.severity,
      description: incident.description,
      status: incident.status,
      incident_time: incident.incident_time,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
    }));

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

export async function fetchKanbanCategoryContents(
  category: string,
  count: number = 50
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select()
      .eq('status', category)
      .limit(count);
    if (error) {
      console.error('Error fetching incident:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
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
