'use client';

import { useEffect, useState } from 'react';

import {
  Map,
  MapControls,
  MapHeatmapLayer,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from '@/components/control-center/map/map';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  getSeverityWeight,
  HEATMAP_COLOR_RAMP,
  HEATMAP_FADE_END_ZOOM,
  MARKER_VISIBILITY_ZOOM,
} from './incident-map-scene.helpers';
import {
  HeatmapLegend,
  IncidentMarkerCard,
  IncidentMarkerVisual,
  UserLocationMarker,
} from './incident-map-scene.parts';
import type { IncidentMapSceneProps } from './incident-map-scene.types';

export type {
  DestinationMarker,
  IncidentMarker,
} from './incident-map-scene.types';

export function IncidentMapScene({
  markers,
  destination,
}: IncidentMapSceneProps) {
  const isMobile = useIsMobile();
  const [activeRouteMarkerId, setActiveRouteMarkerId] = useState<string | null>(
    null
  );
  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [activeDestination, setActiveDestination] = useState(destination);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'fallback'
  >('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );
  const [routeStatus, setRouteStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [routeErrorMessage, setRouteErrorMessage] = useState<string | null>(
    null
  );

  const selectedMarker =
    markers.find((marker) => marker.id === activeRouteMarkerId) ?? null;
  const hasMarkers = markers.length > 0;
  const showIncidentMarkers = mapZoom >= MARKER_VISIBILITY_ZOOM;
  const resolvedDestination =
    locationStatus === 'granted' || locationStatus === 'fallback'
      ? activeDestination
      : null;
  const baseZoom =
    showIncidentMarkers && selectedMarker && resolvedDestination
      ? isMobile
        ? 11
        : 12
      : hasMarkers
        ? isMobile
          ? 13
          : 14
        : isMobile
          ? 12
          : 13;

  const heatmapData: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    {
      id: string;
      weight: number;
      severity?: IncidentMapSceneProps['markers'][number]['severity'];
    }
  > = {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      properties: {
        id: marker.id,
        weight: getSeverityWeight(marker.severity),
        severity: marker.severity ?? null,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  };

  const mapCenter: [number, number] =
    showIncidentMarkers && selectedMarker && resolvedDestination
      ? [
          (selectedMarker.longitude + resolvedDestination.longitude) / 2,
          (selectedMarker.latitude + resolvedDestination.latitude) / 2,
        ]
      : showIncidentMarkers && selectedMarker
        ? [selectedMarker.longitude, selectedMarker.latitude]
        : hasMarkers
          ? [markers[0].longitude, markers[0].latitude]
          : resolvedDestination
            ? [resolvedDestination.longitude, resolvedDestination.latitude]
            : [destination.longitude, destination.latitude];

  useEffect(() => {
    if (!activeRouteMarkerId && !openMarkerId) return;

    const markerExists = markers.some(
      (marker) =>
        marker.id === activeRouteMarkerId || marker.id === openMarkerId
    );
    if (!markerExists) {
      setActiveRouteMarkerId(null);
      setOpenMarkerId(null);
    }
  }, [activeRouteMarkerId, markers, openMarkerId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setActiveDestination(destination);
      setLocationStatus('fallback');
      setLocationMessage('Location unavailable, using the MDRRMO destination.');
      return;
    }

    setLocationStatus('requesting');
    setLocationMessage('Requesting your location for route guidance.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActiveDestination({
          id: 'user-location',
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          label: 'Your location',
        });
        setLocationStatus('granted');
        setLocationMessage('Using your location as the route destination.');
      },
      () => {
        setActiveDestination(destination);
        setLocationStatus('fallback');
        setLocationMessage(
          'Location permission denied, using the MDRRMO destination.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [destination]);

  useEffect(() => {
    if (
      !showIncidentMarkers ||
      locationStatus === 'idle' ||
      locationStatus === 'requesting' ||
      !resolvedDestination
    ) {
      setRouteCoordinates([]);
      setRouteStatus('idle');
      setRouteErrorMessage(null);
      return;
    }

    if (!selectedMarker) {
      setRouteCoordinates([]);
      setRouteStatus('idle');
      setRouteErrorMessage(null);
      return;
    }

    const controller = new AbortController();

    async function loadRoute() {
      setRouteStatus('loading');
      setRouteErrorMessage(null);

      try {
        const routeOrigin = selectedMarker;
        const routeDestination = resolvedDestination;

        if (!routeOrigin || !routeDestination) {
          setRouteCoordinates([]);
          setRouteStatus('idle');
          return;
        }

        const params = new URLSearchParams({
          startLng: String(routeOrigin.longitude),
          startLat: String(routeOrigin.latitude),
          endLng: String(routeDestination.longitude),
          endLat: String(routeDestination.latitude),
        });

        const response = await fetch(
          `/api/directions_map?${params.toString()}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          }
        );

        const payload = (await response.json()) as {
          coordinates?: [number, number][];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to fetch route.');
        }

        const coordinates = Array.isArray(payload.coordinates)
          ? payload.coordinates
          : [];

        if (coordinates.length < 2) {
          throw new Error('Route geometry is empty.');
        }

        setRouteCoordinates(coordinates);
        setRouteStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to load road route:', error);
        setRouteCoordinates([]);
        setRouteStatus('error');
        setRouteErrorMessage(
          error instanceof Error ? error.message : 'Could not load route.'
        );
      }
    }

    void loadRoute();

    return () => {
      controller.abort();
    };
  }, [
    locationStatus,
    resolvedDestination,
    selectedMarker,
    showIncidentMarkers,
  ]);

  return (
    <div className="flex h-full flex-1 flex-col">
      {!showIncidentMarkers && isMobile ? <HeatmapLegend mobile /> : null}
      <Card className="relative min-h-[calc(100dvh-var(--header-height))] flex-1 overflow-hidden rounded-none border-0 p-0 shadow-none">
        <Map
          center={mapCenter}
          zoom={baseZoom}
          onViewportChange={(viewport) => {
            setMapZoom(viewport.zoom);
          }}
        >
          {hasMarkers ? (
            <MapHeatmapLayer
              id="incident-severity-heatmap"
              data={heatmapData}
              colorRamp={HEATMAP_COLOR_RAMP}
              fadeStartZoom={MARKER_VISIBILITY_ZOOM}
              maxVisibleZoom={HEATMAP_FADE_END_ZOOM}
            />
          ) : null}

          {routeCoordinates.length >= 2 ? (
            <MapRoute
              coordinates={routeCoordinates}
              color="#1d4ed8"
              casingColor="rgba(255,255,255,0.98)"
              casingWidth={11}
              width={7}
              opacity={0.96}
            />
          ) : null}

          {showIncidentMarkers
            ? markers.map((marker) => {
                const isSelected = marker.id === selectedMarker?.id;
                const isOpen = marker.id === openMarkerId;

                return (
                  <MapMarker
                    key={marker.id}
                    longitude={marker.longitude}
                    latitude={marker.latitude}
                    onClick={() => {
                      setActiveRouteMarkerId(marker.id);
                      setOpenMarkerId(marker.id);
                    }}
                  >
                    <MarkerContent className="opacity-95">
                      <IncidentMarkerVisual
                        severity={marker.severity}
                        selected={isSelected}
                      />
                    </MarkerContent>
                    {!isOpen ? (
                      <MarkerTooltip
                        className="border-0 bg-transparent p-0 shadow-none"
                        closeOnMove={true}
                      >
                        <IncidentMarkerCard marker={marker} />
                      </MarkerTooltip>
                    ) : null}
                    <MarkerPopup
                      open={isOpen}
                      onOpenChange={(open) => {
                        if (!open && openMarkerId === marker.id) {
                          setOpenMarkerId(null);
                        }
                      }}
                      closeButton
                      closeOnMove={false}
                      className="border-0 bg-transparent p-0 shadow-none"
                    >
                      <IncidentMarkerCard marker={marker} />
                    </MarkerPopup>
                  </MapMarker>
                );
              })
            : null}

          {showIncidentMarkers && resolvedDestination ? (
            <UserLocationMarker
              destination={resolvedDestination}
              locationStatus={locationStatus}
            />
          ) : null}

          <MapControls />
        </Map>
        {!hasMarkers ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            No SQL-backed incident markers found.
          </div>
        ) : locationStatus === 'requesting' ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            {locationMessage}
          </div>
        ) : !showIncidentMarkers ? (
          isMobile ? null : (
            <HeatmapLegend />
          )
        ) : !selectedMarker ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            {locationMessage ??
              `Click an incident marker to preview the route to ${resolvedDestination?.label ?? 'the destination'}.`}
          </div>
        ) : routeStatus === 'loading' ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Loading road-based route to{' '}
            {resolvedDestination?.label ?? 'the destination'}.
          </div>
        ) : routeStatus === 'error' ? (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            {routeErrorMessage ??
              'Could not load a road route for this marker.'}
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Routing from {selectedMarker.label ?? 'Selected incident'} to{' '}
            {resolvedDestination?.label ?? 'the destination'}.
          </div>
        )}
      </Card>
    </div>
  );
}
