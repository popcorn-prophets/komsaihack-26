'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchIncidents } from '@/lib/supabase/reports';
import * as React from 'react';
import KanbanContent from './kanban-view/content';
import { ChatBox } from './report-view/chatbox';
import { ReportContainer } from './report-view/report-container';
import IncidentCard from './report-view/report-list/incidents-card';

export function IncidentTabs() {
  const [selectedIncidentID, setSelectedIncidentID] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const loadInitialIncident = async () => {
      const incidents = await fetchIncidents(1);
      if (incidents && incidents.length > 0) {
        setSelectedIncidentID(incidents[0].id);
      }
    };
    loadInitialIncident();
  }, []);

  const handleOnIncidentClick = (clickedIncidentID: string) => {
    setSelectedIncidentID(clickedIncidentID);
  };

  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList variant="line" className="w-full flex flex-1 flex-row">
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
      </TabsList>
      <TabsContent value="reports" className="flex flex-row w-full gap-4">
        <IncidentCard onIncidentSelect={handleOnIncidentClick} />
        <ChatBox />
        <ReportContainer incident={selectedIncidentID} />
      </TabsContent>
      <TabsContent value="kanban" className="flex flex-row w-full gap-4">
        <KanbanContent title="New" />
        <KanbanContent title="Validated" />
        <KanbanContent title="In Progress" />
        <KanbanContent title="Resolved" />
        <KanbanContent title="Dismissed" />
      </TabsContent>
    </Tabs>
  );
}
