'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdvisoryComposeForm } from '@/components/advisory-compose-form';
import {
  Map,
  MapControls,
  MapMarker,
  MapPolygonDraw,
  MarkerContent,
  MarkerLabel,
  type MapPolygonDrawProps,
  type MapPolygonFeature,
  type MapRef,
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

function arePolygonCoordinatesEqual(
  left: [number, number][] | null,
  right: [number, number][] | null
) {
  if (left === right) return true;
  if (!left || !right) return false;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (
      left[index][0] !== right[index][0] ||
      left[index][1] !== right[index][1]
    ) {
      return false;
    }
  }

  return true;
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
  const mapRef = useRef<MapRef | null>(null);
  const hasCenteredFromGeolocationRef = useRef(false);
  const [polygonCoordinates, setPolygonCoordinates] = useState<
    [number, number][] | null
  >(null);

  useEffect(() => {
    if (hasCenteredFromGeolocationRef.current) {
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        hasCenteredFromGeolocationRef.current = true;
        mapRef.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 13,
          duration: 900,
        });
      },
      () => {
        // Keep default center when geolocation is unavailable or denied.
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

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

  const selectedResidentIdsJson = useMemo(() => {
    if (!polygonCoordinates) return '';
    return JSON.stringify(Array.from(selectedResidentIds));
  }, [polygonCoordinates, selectedResidentIds]);

  const polygonModeOptions = useMemo<
    NonNullable<MapPolygonDrawProps['polygonModeOptions']>
  >(
    () => ({
      styles: {
        fillColor: '#f59e0b',
        fillOpacity: 0.25,
        outlineColor: '#ea580c',
        outlineOpacity: 0.95,
        outlineWidth: 2,
        closingPointColor: '#f59e0b',
        closingPointWidth: 4,
        closingPointOutlineColor: '#ea580c',
        closingPointOutlineWidth: 2,
      },
    }),
    []
  );

  const selectModeOptions = useMemo<
    NonNullable<MapPolygonDrawProps['selectModeOptions']>
  >(
    () => ({
      styles: {
        selectedPolygonColor: '#f59e0b',
        selectedPolygonFillOpacity: 0.3,
        selectedPolygonOutlineColor: '#c2410c',
        selectedPolygonOutlineWidth: 2,
      },
    }),
    []
  );

  const handlePolygonChange = useCallback((features: MapPolygonFeature[]) => {
    const nextPolygon = getPolygonCoordinates(features);

    setPolygonCoordinates((currentPolygon) =>
      arePolygonCoordinatesEqual(currentPolygon, nextPolygon)
        ? currentPolygon
        : nextPolygon
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card className="h-60 overflow-hidden p-0">
        <Map ref={mapRef} center={[121.0533, 14.6512]} zoom={11}>
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
                        ? 'size-3 rounded-full border-2 border-amber-100 bg-amber-500 shadow-lg shadow-amber-500/40'
                        : 'size-2.5 rounded-full border-2 border-amber-50 bg-amber-300 shadow-sm shadow-amber-400/40'
                    }
                  />
                </MarkerContent>
                <MarkerLabel
                  position="top"
                  className={
                    isSelected
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-amber-700/80 dark:text-amber-300/80'
                  }
                >
                  {resident.name ?? 'Resident'}
                </MarkerLabel>
              </MapMarker>
            );
          })}
          <MapPolygonDraw
            polygonModeOptions={polygonModeOptions}
            selectModeOptions={selectModeOptions}
            onChange={handlePolygonChange}
          />
          <MapControls showZoom showCompass />
        </Map>
      </Card>

      <AdvisoryComposeForm
        templates={templates}
        targetPolygon={polygonJson}
        targetResidentIds={selectedResidentIdsJson}
      />
    </div>
  );
}
