'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { fetchIncidents, type Incident } from '@/lib/supabase/reports';
import * as React from 'react';
import IncidentEntry from './incident-entry';

async function getReportData(count: number = 50): Promise<Incident[] | null> {
  const incidents = await fetchIncidents(count);

  if (incidents) return incidents;
  else {
    console.error('No Data found');
    return null;
  }
}

export function IncidentList() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      const data = await getReportData();
      if (data) {
        setIncidents(data);
      }
      setLoading(false);
    };

    loadIncidents();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ScrollArea className={`h-full w-full rounded-md`}>
      <div className="p-4">
        {incidents.map((incident) => (
          <React.Fragment key={incident.id}>
            <IncidentEntry id={incident.incident_time} />
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
