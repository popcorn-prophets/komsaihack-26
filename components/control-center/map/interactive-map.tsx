'use client';

import { useState } from 'react';

import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
} from '@/components/control-center/map/map';
import { Card } from '@/components/ui/card';

export type IncidentMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label?: string | null;
};

type DestinationMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label: string;
};

type InteractiveMapProps = {
  markers: IncidentMarker[];
  destination: DestinationMarker;
};

export function InteractiveMap({ markers, destination }: InteractiveMapProps) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    markers[0]?.id ?? null
  );

  const selectedMarker =
    markers.find((marker) => marker.id === selectedMarkerId) ??
    markers[0] ??
    null;
  const hasMarkers = markers.length > 0;

  const markerMapCenter: [number, number] = hasMarkers
    ? [markers[0].longitude, markers[0].latitude]
    : [destination.longitude, destination.latitude];

  const routeCoordinates: [number, number][] = selectedMarker
    ? [
        [selectedMarker.longitude, selectedMarker.latitude],
        [destination.longitude, destination.latitude],
      ]
    : [];

  const routeMapCenter: [number, number] = selectedMarker
    ? [
        (selectedMarker.longitude + destination.longitude) / 2,
        (selectedMarker.latitude + destination.latitude) / 2,
      ]
    : [destination.longitude, destination.latitude];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
      <Card className="relative h-[340px] overflow-hidden p-0 lg:h-[520px]">
        <Map center={markerMapCenter} zoom={hasMarkers ? 14 : 13}>
          {markers.map((marker) => {
            const isSelected = marker.id === selectedMarker?.id;

            return (
              <MapMarker
                key={marker.id}
                longitude={marker.longitude}
                latitude={marker.latitude}
                onClick={() => setSelectedMarkerId(marker.id)}
              >
                <MarkerContent
                  className={
                    isSelected
                      ? 'rounded-full ring-4 ring-emerald-300/70'
                      : undefined
                  }
                />
                {marker.label ? (
                  <MarkerTooltip>
                    {isSelected
                      ? `${marker.label} · selected`
                      : `${marker.label} · click to route`}
                  </MarkerTooltip>
                ) : null}
              </MapMarker>
            );
          })}
          <MapControls />
        </Map>
        {!hasMarkers ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            No SQL-backed incident markers found.
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Click here to check the routing for the nearest MDDRRMO
          </div>
        )}
      </Card>

      <Card className="relative h-[340px] overflow-hidden p-0 lg:h-[520px]">
        <Map center={routeMapCenter} zoom={selectedMarker ? 12 : 14}>
          {routeCoordinates.length >= 2 ? (
            <MapRoute coordinates={routeCoordinates} width={5} opacity={0.9} />
          ) : null}

          {selectedMarker ? (
            <MapMarker
              longitude={selectedMarker.longitude}
              latitude={selectedMarker.latitude}
            >
              <MarkerContent className="rounded-full ring-4 ring-emerald-300/70" />
              <MarkerTooltip>
                {selectedMarker.label ?? 'Selected incident'}
              </MarkerTooltip>
            </MapMarker>
          ) : null}

          <MapMarker
            longitude={destination.longitude}
            latitude={destination.latitude}
          >
            <MarkerContent className="rounded-full ring-4 ring-sky-300/70" />
            <MarkerTooltip>{destination.label}</MarkerTooltip>
          </MapMarker>

          <MapControls />
        </Map>
        {!selectedMarker ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Route preview is waiting for one real incident marker from SQL.
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Routing from {selectedMarker.label ?? 'Selected incident'} to{' '}
            {destination.label}.
          </div>
        )}
      </Card>
    </div>
  );
}
