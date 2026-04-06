'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import ReportDetails from './report-details';

interface ReportContainerProps {
  defaultTab?: string;
  incident: string | null;
}

export const ReportContainer: React.FC<ReportContainerProps> = ({
  incident,
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ScrollArea className="h-full w-full">
        <ReportDetails incidentID={incident} />
      </ScrollArea>
    </div>
  );
};

export default ReportContainer;
