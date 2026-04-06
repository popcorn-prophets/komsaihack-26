'use client';

import Link from 'next/link';

import { IncidentMapSceneShell } from '@/components/control-center/map/incident-map-scene-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardPayload } from '@/lib/control-center-dashboard';
import { ExternalLinkIcon } from 'lucide-react';

type DashboardMapPreviewProps = {
  mapMarkers: DashboardPayload['mapMarkers'];
};

export function DashboardMapPreview({ mapMarkers }: DashboardMapPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Incident Map</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-80 overflow-hidden rounded-md border">
          <IncidentMapSceneShell
            embedded
            markers={mapMarkers.markers}
            destination={mapMarkers.destination}
          />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Use the full map page for routing and heatmap details.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href="/control-center/map">
            Open full map <ExternalLinkIcon />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
