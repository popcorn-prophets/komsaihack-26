import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
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

  // TODO: refactor measurements to accept relative values
  return (
    <Card className="flex w-full max-h-[calc(100vh-150px)] max-w-xs">
      <CardHeader className="border-b">
        <CardTitle>Reports</CardTitle>
        <FieldGroup className="flex flex-col flex-1">
          <IncidentSorter onChangeSort={handleSortChange} />
        </FieldGroup>
      </CardHeader>
      <CardContent className="h-[calc(100vh-275px)]">
        <IncidentList onIncidentSelect={handleIncidentSelect} sort={sort} />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
