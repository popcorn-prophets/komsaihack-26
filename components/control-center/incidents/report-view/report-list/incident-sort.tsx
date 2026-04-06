'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IncidentSorterProps {
  onChangeSort?: (sortBy: string, order: string) => void;
}

export function IncidentSorter({ onChangeSort }: IncidentSorterProps) {
  const [sortBy, setSortBy] = React.useState('incident_time');
  const [sortOrder, setSortOrder] = React.useState('descending');

  function changeSortBy(sortBy: string) {
    setSortBy(sortBy);
    onChangeSort!(sortBy, sortOrder);
  }

  function changeSortOrder(order: string) {
    setSortOrder(order);
    onChangeSort!(sortBy, sortOrder);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Sort</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sortBy} onValueChange={changeSortBy}>
            <DropdownMenuRadioItem value="incident_time">
              Time
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="severity">
              Severity
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={sortOrder}
            onValueChange={changeSortOrder}
          >
            <DropdownMenuRadioItem value="ascending">
              Ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="descending">
              Descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
