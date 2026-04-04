'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { IconUserCircle } from '@tabler/icons-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ResidentDirectoryRow } from '@/lib/residents/types';

import {
  formatCoordinates,
  formatLanguage,
  formatPlatform,
  formatTimestamp,
  getInitials,
} from './residents-directory-utils';

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
      header: 'Action',
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

export function ResidentsDataTable({
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
              <TableHead
                key={header.id}
                className={
                  header.column.id === 'action' ? 'text-right' : undefined
                }
              >
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
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === 'action' ? 'text-right' : undefined
                  }
                >
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
