'use client';

import dynamic from 'next/dynamic';

import { Card } from '@/components/ui/card';

import type { IncidentMarker } from './interactive-map';

const InteractiveMap = dynamic(
  () => import('./interactive-map').then((module) => module.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full flex-1 flex-col">
        <Card className="relative min-h-[calc(100dvh-var(--header-height))] flex-1 overflow-hidden rounded-none border-0 p-0 shadow-none">
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Loading map.
          </div>
        </Card>
      </div>
    ),
  }
);

type InteractiveMapShellProps = {
  markers: IncidentMarker[];
  destination: {
    id: string;
    longitude: number;
    latitude: number;
    label: string;
  };
};

export function InteractiveMapShell(props: InteractiveMapShellProps) {
  return <InteractiveMap {...props} />;
}
