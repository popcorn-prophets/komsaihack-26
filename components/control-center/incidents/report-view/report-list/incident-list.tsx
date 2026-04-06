'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchIncidents, type Incident } from '@/lib/supabase/reports';
import * as React from 'react';
import IncidentEntry from './incident-entry';

const SORTBY = 0;
const SORTORDER = 1;

interface IncidentListProps {
  onIncidentSelect?: (incidentID: string) => void;
  sort: string[];
}

async function getReportData(
  sort: string[],
  count: number = 50
): Promise<Incident[] | null> {
  const incidents = await fetchIncidents(sort[SORTBY], sort[SORTORDER], count);

  if (incidents) return incidents;
  else {
    console.error('No Data found');
    return null;
  }
}

export function IncidentList({ onIncidentSelect, sort }: IncidentListProps) {
  // NOTE: Refactor to shorten code
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = React.useState<string | null>(
    null
  );
  const isFirstLoadRef = React.useRef(true);

  // display loading
  React.useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await getReportData(sort);
        if (data && data.length > 0) {
          setIncidents(data);

          if (isFirstLoadRef.current) {
            const firstIncidentId = data[0].id;
            setSelectedIncident(firstIncidentId);
            onIncidentSelect?.(firstIncidentId);
            isFirstLoadRef.current = false;
          }
        }
      } catch (error) {
        console.error('Failed to load incidents:', error);
      }
    };

    loadIncidents();
    // All external variables used inside must be in the dependency array
  }, [onIncidentSelect, setIncidents, setSelectedIncident, sort]);

  const handleIncidentClick = (id: string) => {
    setSelectedIncident(id);
    if (id) onIncidentSelect!(id);
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex min-w-0 flex-col gap-2 p-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="min-w-0 w-full">
            <IncidentEntry
              incident={incident}
              isSelected={selectedIncident === incident.id}
              onClick={handleIncidentClick}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
