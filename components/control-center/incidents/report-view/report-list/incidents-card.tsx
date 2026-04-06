import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { IncidentList } from './incident-list';
import { IncidentSorter } from './incident-sort';

interface IncidentCardProps {
  onIncidentSelect?: (incidentID: string) => void;
}

export default function IncidentsCard({ onIncidentSelect }: IncidentCardProps) {
  const [sort, setSort] = React.useState<string[]>([
    'incident_time',
    'descending',
  ]);

  const handleIncidentSelect = (incidentID: string) => {
    if (incidentID) onIncidentSelect!(incidentID);
  };

  const handleSortChange = (sortBy: string, order: string) => {
    setSort([sortBy, order]);
  };

  return (
    <Card className="shadow-none border-0 flex h-full w-full flex-col gap-1">
      <IncidentSorter onChangeSort={handleSortChange} />
      <CardContent className="min-h-0 flex-1 p-0">
        <IncidentList onIncidentSelect={handleIncidentSelect} sort={sort} />
      </CardContent>
    </Card>
  );
}
