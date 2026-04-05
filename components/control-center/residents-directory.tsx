'use client';

import { useDeferredValue, useState } from 'react';
import { IconAddressBook } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ResidentDirectoryRow } from '@/lib/residents/types';

import { ResidentsDirectoryFilters } from './residents-directory-filters';
import { ResidentDetailSheet } from './residents-directory-sheet';
import { ResidentsDataTable } from './residents-directory-table';
import { ResidentsDirectorySummary } from './residents-directory-summary';
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
            Residents directory
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Residents</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Browse onboarded residents, review platform identities, and
              inspect saved location data for control-center operations.
            </p>
          </div>
        </div>

        <ResidentsDirectorySummary {...residentStats} />

        <Card>
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Resident directory</CardTitle>
              <CardDescription>
                Search by resident name, platform identity, or thread reference.
                Filter the list by messaging platform and language.
              </CardDescription>
            </div>
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
