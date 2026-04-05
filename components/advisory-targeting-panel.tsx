'use client';

import { useMemo, useState } from 'react';

import { AdvisoryComposeForm } from '@/components/advisory-compose-form';
import {
  Map,
  MapControls,
  MapMarker,
  MapPolygonDraw,
  MarkerContent,
  MarkerLabel,
  type MapPolygonFeature,
} from '@/components/control-center/map/map';
import { Card } from '@/components/ui/card';
import type { AdvisoryTemplateItem } from '@/lib/advisories/types';
import type { ResidentDirectoryRow } from '@/lib/residents/types';

function getPolygonCoordinates(
  features: MapPolygonFeature[]
): [number, number][] | null {
  if (features.length === 0) return null;

  const latestFeature = features[features.length - 1];
  const ring = latestFeature.geometry.coordinates[0];

  if (!Array.isArray(ring) || ring.length < 4) {
    return null;
  }

  return ring as [number, number][];
}

function pointInPolygon(point: [number, number], polygon: [number, number][]) {
  const [x, y] = point;
  let inside = false;

  for (
    let index = 0, previous = polygon.length - 1;
    index < polygon.length;
    previous = index++
  ) {
    const [xi, yi] = polygon[index];
    const [xj, yj] = polygon[previous];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function AdvisoryTargetingPanel({
  templates,
  residents,
}: {
  templates: AdvisoryTemplateItem[];
  residents: ResidentDirectoryRow[];
}) {
  const [polygonCoordinates, setPolygonCoordinates] = useState<
    [number, number][] | null
  >(null);

  const polygonJson = useMemo(() => {
    if (!polygonCoordinates) return '';
    return JSON.stringify({
      type: 'Polygon',
      coordinates: [polygonCoordinates],
    });
  }, [polygonCoordinates]);

  const residentsWithCoordinates = useMemo(
    () =>
      residents.filter(
        (
          resident
        ): resident is ResidentDirectoryRow & {
          longitude: number;
          latitude: number;
        } =>
          typeof resident.longitude === 'number' &&
          typeof resident.latitude === 'number'
      ),
    [residents]
  );

  const selectedResidentIds = useMemo(() => {
    if (!polygonCoordinates) return new Set<string>();

    return new Set(
      residentsWithCoordinates
        .filter((resident) =>
          pointInPolygon(
            [resident.longitude, resident.latitude],
            polygonCoordinates
          )
        )
        .map((resident) => resident.id)
    );
  }, [polygonCoordinates, residentsWithCoordinates]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="h-60 overflow-hidden p-0">
        <Map center={[121.0533, 14.6512]} zoom={11}>
          {residentsWithCoordinates.map((resident) => {
            const isSelected = selectedResidentIds.has(resident.id);

            return (
              <MapMarker
                key={resident.id}
                longitude={resident.longitude}
                latitude={resident.latitude}
                pitchAlignment="viewport"
              >
                <MarkerContent
                  className={
                    isSelected
                      ? 'scale-125'
                      : 'opacity-75 transition-opacity hover:opacity-100'
                  }
                >
                  <div
                    className={
                      isSelected
                        ? 'size-3 rounded-full border-2 border-background bg-primary shadow-lg shadow-primary/30'
                        : 'size-2.5 rounded-full border-2 border-background bg-muted-foreground/70 shadow-sm'
                    }
                  />
                </MarkerContent>
                <MarkerLabel
                  position="top"
                  className={
                    isSelected
                      ? 'text-primary'
                      : 'text-muted-foreground opacity-75'
                  }
                >
                  {resident.name ?? 'Resident'}
                </MarkerLabel>
              </MapMarker>
            );
          })}
          <MapPolygonDraw
            onChange={(features) => {
              setPolygonCoordinates(getPolygonCoordinates(features));
            }}
          />
          <MapControls showZoom showCompass />
        </Map>
      </Card>

      <AdvisoryComposeForm templates={templates} targetPolygon={polygonJson} />
    </div>
  );
}
