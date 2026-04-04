'use client';

import IncidentEntry from '@/components/control-center/incidents/report-view/report-list//incident-entry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import React, { useState } from 'react';
import CategoryCard from './category';

interface KanbanContentProps {
  title: string;
  incidentCount?: number;
  onIncidentSelect?: (id: string) => void;
  className?: string;
}

function getIncidentData(count: number = 50) {
  // TODO: replace function to fetch content from database
  const entries = [];
  for (let i = 0; i < count; i++) {
    entries.push(i.toString());
  }
  return entries;
}

function KanbanContent({
  title,
  incidentCount = 50,
  onIncidentSelect,
  className = '',
}: KanbanContentProps) {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const handleIncidentClick = (id: string) => {
    setSelectedIncident(id);
    onIncidentSelect?.(id);
  };

  const incidents = getIncidentData(incidentCount);

  return (
    <CategoryCard title={title} className={className}>
      <ScrollArea className="h-full rounded-md flex max-h-[calc(100vh-275px)]">
        <div className="p-4">
          {incidents.map((incidentId, index) => (
            <React.Fragment key={incidentId}>
              <div className="text-sm">
                <IncidentEntry
                  id={incidentId}
                  isSelected={selectedIncident === incidentId}
                  onClick={handleIncidentClick}
                />
              </div>
              {index < incidents.length - 1 && <Separator className="my-2" />}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </CategoryCard>
  );
}

export default KanbanContent;
