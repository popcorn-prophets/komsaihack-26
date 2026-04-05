'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { fetchIncidents, type Incident } from '@/lib/supabase/reports';
import * as React from 'react';
import IncidentEntry from './incident-entry';

interface IncidentListProps {
  onIncidentSelect?: (incidentID: string) => void;
}

async function getReportData(count: number = 50): Promise<Incident[] | null> {
  const incidents = await fetchIncidents(count);

  if (incidents) return incidents;
  else {
    console.error('No Data found');
    return null;
  }
}

export function IncidentList({ onIncidentSelect }: IncidentListProps) {
  // NOTE: Refactor to increase shorten code
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIncident, setSelectedIncident] = React.useState<string | null>(
    null
  );
  const isFirstLoadRef = React.useRef(true);

  // display loading
  React.useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      const data = await getReportData();
      if (data) {
        setIncidents(data);
        if (isFirstLoadRef.current) {
          const firstIncidentId = data[0].id;
          setSelectedIncident(firstIncidentId);
          onIncidentSelect?.(firstIncidentId);
          isFirstLoadRef.current = false;
        }
      }
      setLoading(false);
    };

    loadIncidents();
  }, []);

  const handleIncidentClick = (id: string) => {
    setSelectedIncident(id);
    if (id) onIncidentSelect!(id);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ScrollArea className={`h-full w-full rounded-md`}>
      <div className="p-4">
        {incidents.map((incident) => (
          <React.Fragment key={incident.id}>
            <IncidentEntry
              id={incident.incident_time}
              isSelected={selectedIncident === incident.id}
              onClick={() => handleIncidentClick(incident.id)}
            />
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
