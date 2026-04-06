'use client';

import { IconSearch } from '@tabler/icons-react';
import type { Dispatch, SetStateAction } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RESIDENT_LANGUAGE_OPTIONS } from '@/lib/residents/languages';
import type { ResidentDirectoryFilters } from '@/lib/residents/types';

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

export function ResidentsDirectoryFilters({
  filters,
  onFiltersChange,
}: {
  filters: ResidentDirectoryFilters;
  onFiltersChange: Dispatch<SetStateAction<ResidentDirectoryFilters>>;
}) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
      <SearchField
        query={filters.query}
        onQueryChange={(query) =>
          onFiltersChange((current) => ({ ...current, query }))
        }
      />
      <Select
        value={filters.platform}
        onValueChange={(platform) =>
          onFiltersChange((current) => ({
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
          onFiltersChange((current) => ({
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
          {RESIDENT_LANGUAGE_OPTIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
