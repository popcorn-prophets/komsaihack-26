'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchIncidents } from '@/lib/supabase/reports';
import * as React from 'react';
import IncidentKanbanBoard from './kanban-view/board';
import { ChatBox } from './report-view/chatbox';
import { ReportContainer } from './report-view/report-container';
import IncidentCard from './report-view/report-list/incidents-card';

export function IncidentTabs() {
  const [activeTab, setActiveTab] = React.useState<'reports' | 'kanban'>(
    'reports'
  );
  const [selectedIncidentID, setSelectedIncidentID] = React.useState<
    string | null
  >(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const loadInitialIncident = async () => {
      const incidents = await fetchIncidents(undefined, undefined, 1);
      if (incidents && incidents.length > 0) {
        setSelectedIncidentID(incidents[0].id);
      }
    };
    loadInitialIncident();
  }, []);

  const handleOnIncidentClick = (clickedIncidentID: string) => {
    setSelectedIncidentID(clickedIncidentID);
  };

  const handleOpenFullReport = (incidentId: string) => {
    setSelectedIncidentID(incidentId);
    setActiveTab('reports');
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as 'reports' | 'kanban')}
      className="flex w-full min-h-0 flex-col gap-2"
    >
      <TabsList variant="line" className="w-full shrink-0 flex-row">
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
      </TabsList>
      <TabsContent value="reports" className="m-0 w-full min-h-0">
        {isMobile ? (
          <div className="flex w-full flex-col gap-4">
            <div className="h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] overflow-hidden">
              <IncidentCard onIncidentSelect={handleOnIncidentClick} />
            </div>
            <div className="h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] overflow-hidden">
              <ChatBox incidentId={selectedIncidentID} />
            </div>
            <div className="h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] overflow-hidden">
              <ReportContainer incident={selectedIncidentID} />
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] w-full rounded-xl border bg-background"
          >
            <ResizablePanel defaultSize="32%" minSize="20%">
              <div className="h-full min-h-0 overflow-hidden p-3">
                <IncidentCard onIncidentSelect={handleOnIncidentClick} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="33%" minSize="25%">
              <div className="h-full min-h-0 overflow-hidden p-3">
                <ChatBox incidentId={selectedIncidentID} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="35%" minSize="30%">
              <div className="h-full min-h-0 overflow-hidden p-3">
                <ReportContainer incident={selectedIncidentID} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </TabsContent>
      <TabsContent value="kanban" className="m-0 w-full min-h-0 flex-1">
        <IncidentKanbanBoard
          onIncidentSelect={handleOnIncidentClick}
          onOpenFullReport={handleOpenFullReport}
        />
      </TabsContent>
    </Tabs>
  );
}
