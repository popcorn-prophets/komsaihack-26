'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';

function getReportData() {
  // function for grabbing report data from database
  // TODO: replace with appropriate code before live deployment
  // Each data must be a react component to modify chatbox.tsx
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `Sample Report number: ${a.length - i}`
  );
  return tags;
}

export function IncidentList() {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  return (
    // NOTE: refactor max-h to use relative measurements. might cause bugs in current state
    <ScrollArea className={`max-h-[calc(100vh-100px)] w-75 rounded-md border`}>
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {getReportData().map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
