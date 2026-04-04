import { createClient } from '@/lib/supabase/client';

// Initialize Supabase client
const supabase = createClient();

// Type definition for incident
export interface Incident {
  id: string;
  reported_by: string;
  incident_type_id: string;
  location: string;
  location_description: string;
  severity: string;
  description: string;
  status: string;
  incident_time: string;
  created_at: string;
  updated_at: string;
}

// Fetch incidents based on count
export async function fetchIncidents(
  count: number = 50
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select()
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Error fetching incidents:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Fetch incident by ID
export async function fetchIncidentById(id: string): Promise<Incident | null> {
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

// Fetch incidents with filters
export async function fetchIncidentsByStatus(
  status: string
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents by status:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Fetch incidents by severity
export async function fetchIncidentsBySeverity(
  severity: string
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('severity', severity)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents by severity:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Fetch incidents with pagination
export async function fetchIncidentsWithPagination(
  page: number = 1,
  pageSize: number = 10
): Promise<Incident[] | null> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching incidents with pagination:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Fetch incident count
export async function fetchIncidentCount(): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching incident count:', error);
      return null;
    }

    return count;
  } catch (error) {
    console.error('Database fetch error:', error);
    return null;
  }
}

// Search incidents
export async function searchIncidents(
  searchTerm: string
): Promise<Incident[] | null> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .or(
        `description.ilike.%${searchTerm}%,location_description.ilike.%${searchTerm}%,reported_by.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching incidents:', error);
      return null;
    }

    return data as Incident[];
  } catch (error) {
    console.error('Database search error:', error);
    return null;
  }
}

// Listen to real-time incident changes
export function subscribeToIncidents(
  callback: (incident: Incident) => void
): void {
  supabase
    .channel('incidents')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'incidents' },
      (payload) => {
        callback(payload.new as Incident);
      }
    )
    .subscribe();
}
