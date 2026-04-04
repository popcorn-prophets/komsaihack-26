'use client';

import { useDeferredValue, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  IconAddressBook,
  IconSearch,
  IconUserCircle,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type {
  ResidentDirectoryFilters,
  ResidentDirectoryRow,
  ResidentLanguage,
  ResidentPlatform,
} from '@/lib/residents/types';

const INITIAL_FILTERS: ResidentDirectoryFilters = {
  query: '',
  platform: 'all',
  language: 'all',
};

function formatPlatform(platform: ResidentPlatform) {
  return platform === 'telegram' ? 'Telegram' : 'Messenger';
}

function formatLanguage(language: ResidentLanguage) {
  return language === 'fil' ? 'Filipino' : 'English';
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="@container/card">
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[240px]/card:text-3xl">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SearchField({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search residents by name, platform, or thread"
        className="pl-9"
      />
    </div>
  );
}

function getResidentColumns(
  onViewResident: (residentId: string) => void
): ColumnDef<ResidentDirectoryRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Resident',
      cell: ({ row }) => {
        const resident = row.original;

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium">{resident.name}</span>
              <span className="truncate text-sm text-muted-foreground">
                {formatPlatform(resident.platform)} · {resident.platformUserId}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Thread · {resident.threadId}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => (
        <Badge variant="outline">{formatPlatform(row.original.platform)}</Badge>
      ),
    },
    {
      accessorKey: 'language',
      header: 'Language',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {formatLanguage(row.original.language)}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatTimestamp(row.original.createdAt),
    },
    {
      id: 'coordinates',
      header: 'Coordinates',
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {formatCoordinates(row.original.latitude, row.original.longitude)}
        </span>
      ),
    },
    {
      id: 'action',
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onViewResident(row.original.id)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];
}

function ResidentsDataTable({
  residents,
  onViewResident,
}: {
  residents: ResidentDirectoryRow[];
  onViewResident: (residentId: string) => void;
}) {
  const table = useReactTable({
    data: residents,
    columns: getResidentColumns(onViewResident),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="py-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <IconUserCircle className="text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">No matching residents</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust the search or filters to see resident records.
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function ResidentDetailSheet({
  resident,
  open,
  onOpenChange,
}: {
  resident: ResidentDirectoryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!resident) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Resident details</SheetTitle>
            <SheetDescription>
              Select a resident to review onboarding and location data.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{resident.name}</SheetTitle>
          <SheetDescription>
            Review the resident profile captured during onboarding, including
            platform identity and saved coordinates.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">{resident.name}</CardTitle>
                    <Badge variant="outline">
                      {formatPlatform(resident.platform)}
                    </Badge>
                    <Badge variant="secondary">
                      {formatLanguage(resident.language)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Joined {formatTimestamp(resident.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resident profile</CardTitle>
              <CardDescription>
                Read-only onboarding details stored for incident and advisory
                operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Platform user ID
                </div>
                <div className="mt-1 break-all text-sm font-medium">
                  {resident.platformUserId}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Thread ID
                </div>
                <div className="mt-1 break-all text-sm font-medium">
                  {resident.threadId}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Latitude
                </div>
                <div className="mt-1 text-sm font-medium">
                  {resident.latitude.toFixed(6)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Longitude
                </div>
                <div className="mt-1 text-sm font-medium">
                  {resident.longitude.toFixed(6)}
                </div>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resident record ID
                </div>
                <div className="mt-1 break-all font-mono text-sm">
                  {resident.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ResidentsDirectory({
  residents,
}: {
  residents: ResidentDirectoryRow[];
}) {
  const [filters, setFilters] =
    useState<ResidentDirectoryFilters>(INITIAL_FILTERS);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(
    null
  );

  const deferredQuery = useDeferredValue(filters.query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredResidents = residents.filter((resident) => {
    if (filters.platform !== 'all' && resident.platform !== filters.platform) {
      return false;
    }

    if (filters.language !== 'all' && resident.language !== filters.language) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      resident.name,
      formatPlatform(resident.platform),
      resident.platformUserId,
      resident.threadId,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const selectedResident =
    residents.find((resident) => resident.id === selectedResidentId) ?? null;
  const telegramCount = residents.filter(
    (resident) => resident.platform === 'telegram'
  ).length;
  const messengerCount = residents.filter(
    (resident) => resident.platform === 'messenger'
  ).length;
  const filipinoCount = residents.filter(
    (resident) => resident.language === 'fil'
  ).length;
  const englishCount = residents.length - filipinoCount;

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

        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <SummaryCard
            label="Total residents"
            value={residents.length.toString()}
            description="All onboarded resident profiles in the control center."
          />
          <SummaryCard
            label="Telegram"
            value={telegramCount.toString()}
            description="Residents connected through the Telegram adapter."
          />
          <SummaryCard
            label="Messenger"
            value={messengerCount.toString()}
            description="Residents connected through the Messenger adapter."
          />
          <SummaryCard
            label="Language split"
            value={`${filipinoCount} FIL / ${englishCount} ENG`}
            description="Preferred response language captured during onboarding."
          />
        </div>

        <Card>
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Resident directory</CardTitle>
              <CardDescription>
                Search by resident name, platform identity, or thread reference.
                Filter the list by messaging platform and language.
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
              <SearchField
                query={filters.query}
                onQueryChange={(query) =>
                  setFilters((current) => ({ ...current, query }))
                }
              />
              <Select
                value={filters.platform}
                onValueChange={(platform) =>
                  setFilters((current) => ({
                    ...current,
                    platform: platform as ResidentDirectoryFilters['platform'],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.language}
                onValueChange={(language) =>
                  setFilters((current) => ({
                    ...current,
                    language: language as ResidentDirectoryFilters['language'],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  <SelectItem value="fil">Filipino</SelectItem>
                  <SelectItem value="eng">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
