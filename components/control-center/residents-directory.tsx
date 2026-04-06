'use client';

import { IconAddressBook } from '@tabler/icons-react';
import { useDeferredValue, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ResidentDirectoryRow } from '@/lib/residents/types';

import { ResidentsDirectoryFilters } from './residents-directory-filters';
import { ResidentDetailSheet } from './residents-directory-sheet';
import { ResidentsDirectorySummary } from './residents-directory-summary';
import { ResidentsDataTable } from './residents-directory-table';
import {
  INITIAL_FILTERS,
  filterResidentDirectory,
  getResidentDirectoryStats,
  normalizeResidentSearchQuery,
} from './residents-directory-utils';

export function ResidentsDirectory({
  residents,
}: {
  residents: ResidentDirectoryRow[];
}) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(
    null
  );

  const deferredQuery = useDeferredValue(filters.query);
  const normalizedQuery = normalizeResidentSearchQuery(deferredQuery);

  const filteredResidents = filterResidentDirectory(
    residents,
    filters,
    normalizedQuery
  );
  const selectedResident =
    residents.find((resident) => resident.id === selectedResidentId) ?? null;
  const residentStats = getResidentDirectoryStats(residents);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="gap-1">
            <IconAddressBook />
            Residents Directory
          </Badge>
        </div>

        <ResidentsDirectorySummary {...residentStats} />

        <Card>
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1"></div>
            <ResidentsDirectoryFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardHeader>
          <CardContent>
            <ResidentsDataTable
              residents={filteredResidents}
              onViewResident={setSelectedResidentId}
            />
          </CardContent>
        </Card>
      </div>

      <ResidentDetailSheet
        resident={selectedResident}
        open={selectedResident !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedResidentId(null);
          }
        }}
      />
    </>
  );
}
