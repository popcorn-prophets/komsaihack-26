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
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
  });

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
        <Button ref={triggerRef} variant="outline">
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: `${triggerWidth}px` }}>
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
