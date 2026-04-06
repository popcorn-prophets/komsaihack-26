'use client';

import { useEffect, useState } from 'react';
import type { ExpressionSpecification } from 'maplibre-gl';

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
import { cn } from '@/lib/utils';
import type { Database } from '@/types/supabase';

type IncidentSeverity = Database['public']['Enums']['incident_severity'];

export type IncidentMarker = {
  id: string;
  longitude: number;
  latitude: number;
  label?: string | null;
  severity?: IncidentSeverity | null;
  status?: string | null;
  description?: string | null;
  incidentTime?: string | null;
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

function formatIncidentTime(incidentTime?: string | null) {
  return incidentTime
    ? new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Manila',
      }).format(new Date(incidentTime))
    : 'No incident time';
}

const DEFAULT_SEVERITY_STYLE = {
  weight: 0.35,
  haloClassName: 'h-14 w-14 bg-slate-400/24',
  markerClassName:
    'h-7 w-7 bg-slate-500 shadow-[0_12px_32px_rgba(100,116,139,0.35)]',
  iconWrapperClassName: 'h-4 w-4',
  iconClassName: 'h-2.5 w-2.5',
  badgeClassName: 'bg-slate-500',
};

const SEVERITY_STYLES: Record<
  IncidentSeverity,
  {
    weight: number;
    haloClassName: string;
    markerClassName: string;
    iconWrapperClassName: string;
    iconClassName: string;
    badgeClassName: string;
  }
> = {
  low: {
    weight: 0.25,
    haloClassName: 'h-14 w-14 bg-[#fff5a3]/32',
    markerClassName:
      'h-7 w-7 bg-[#fff5a3] shadow-[0_12px_32px_rgba(255,245,163,0.46)]',
    iconWrapperClassName: 'h-4 w-4',
    iconClassName: 'h-2.5 w-2.5',
    badgeClassName: 'bg-[#fff5a3]',
  },
  moderate: {
    weight: 0.5,
    haloClassName: 'h-16 w-16 bg-[#ffcc66]/36',
    markerClassName:
      'h-8 w-8 bg-[#ffcc66] shadow-[0_14px_34px_rgba(255,204,102,0.46)]',
    iconWrapperClassName: 'h-4.5 w-4.5',
    iconClassName: 'h-2.75 w-2.75',
    badgeClassName: 'bg-[#ffcc66]',
  },
  high: {
    weight: 0.75,
    haloClassName: 'h-[72px] w-[72px] bg-[#f97316]/32',
    markerClassName:
      'h-9 w-9 bg-[#f97316] shadow-[0_16px_38px_rgba(249,115,22,0.5)]',
    iconWrapperClassName: 'h-5 w-5',
    iconClassName: 'h-3 w-3',
    badgeClassName: 'bg-[#f97316]',
  },
  critical: {
    weight: 1,
    haloClassName: 'h-20 w-20 bg-[#dc2626]/34',
    markerClassName:
      'h-10 w-10 bg-[#dc2626] shadow-[0_18px_44px_rgba(220,38,38,0.54)]',
    iconWrapperClassName: 'h-6 w-6',
    iconClassName: 'h-3.5 w-3.5',
    badgeClassName: 'bg-[#dc2626]',
  },
};

function getSeverityStyle(severity?: IncidentSeverity | null) {
  if (!severity) return DEFAULT_SEVERITY_STYLE;

  return SEVERITY_STYLES[severity] ?? DEFAULT_SEVERITY_STYLE;
}

function IncidentMarkerCard({ marker }: { marker: IncidentMarker }) {
  const severityStyle = getSeverityStyle(marker.severity);

  return (
    <div className="w-[280px] overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-2xl">
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Incident
          </p>
          <h3 className="text-base font-semibold leading-tight">
            {marker.label ?? 'Selected incident'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatIncidentTime(marker.incidentTime)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/60 bg-muted/35 px-3 py-2">
            <div className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Severity
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold capitalize">
              <span
                className={cn(
                  'inline-block h-2.5 w-2.5 rounded-full',
                  severityStyle.badgeClassName
                )}
              />
              {marker.severity ?? 'Unknown'}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/35 px-3 py-2">
            <div className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Status
            </div>
            <div className="mt-1 text-sm font-semibold capitalize">
              {marker.status?.replace('_', ' ') ?? 'Unknown'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Description
            </div>
            <p className="mt-1 text-sm leading-6 text-foreground">
              {marker.description ?? 'No incident description provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

//Severity heat map constants
const MARKER_VISIBILITY_ZOOM = 13;
const HEATMAP_FADE_END_ZOOM = 14;
const HEATMAP_COLOR_RAMP: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['heatmap-density'],
  0,
  'rgba(255,245,163,0)',
  0.18,
  'rgba(255,245,163,0.56)',
  0.38,
  'rgba(255,204,102,0.72)',
  0.58,
  'rgba(249,115,22,0.82)',
  0.62,
  'rgba(249,115,22,0.88)',
  0.82,
  'rgba(234,88,12,0.94)',
  1,
  'rgba(220,38,38,0.98)',
];
const HEATMAP_LEGEND_COLORS = [
  '#fff5a3',
  '#ffcc66',
  '#f97316',
  '#ea580c',
  '#dc2626',
];

function HeatmapLegend({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        'w-[200px] overflow-hidden rounded-2xl border border-border/70 bg-background/95 text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.12)] backdrop-blur-sm',
        mobile
          ? 'relative mx-4 mt-4'
          : 'pointer-events-none absolute top-6 left-6 z-10'
      )}
    >
      <div className="space-y-3 p-4">
        <div className="text-[16px] leading-none font-semibold tracking-tight">
          Incident Heatmap
        </div>

        <div className="flex items-center gap-1.5">
          {HEATMAP_LEGEND_COLORS.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="h-2 w-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

function getSeverityWeight(severity?: IncidentSeverity | null) {
  return getSeverityStyle(severity).weight;
}

function IncidentMarkerVisual({
  severity,
  selected,
}: {
  severity?: IncidentSeverity | null;
  selected: boolean;
}) {
  const style = getSeverityStyle(severity);

  return (
    <div
      className={cn(
        'relative z-10 flex items-center justify-center rounded-full transition-transform duration-200',
        selected &&
          'ring-4 ring-emerald-300/70 ring-offset-2 ring-offset-transparent'
      )}
    >
      <div
        className={cn(
          'absolute rounded-full blur-[1.5px]',
          style.haloClassName
        )}
      />
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 border-white/95 text-white',
          style.markerClassName
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-white/24 backdrop-blur-[1px]',
            style.iconWrapperClassName
          )}
        ></div>
      </div>
    </div>
  );
}

export function InteractiveMap({ markers, destination }: InteractiveMapProps) {
  const isMobile = useIsMobile();
  const [activeRouteMarkerId, setActiveRouteMarkerId] = useState<string | null>(
    null
  );
  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [activeDestination, setActiveDestination] =
    useState<DestinationMarker>(destination);
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

  //
  const heatmapData: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    { id: string; weight: number; severity?: IncidentSeverity | null }
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

          {/* Dissapear the user location */}
          {showIncidentMarkers && resolvedDestination ? (
            <MapMarker
              longitude={resolvedDestination.longitude}
              latitude={resolvedDestination.latitude}
            >
              <MarkerContent className="z-20">
                <div className="relative flex items-center justify-center rounded-full">
                  <div className="absolute h-14 w-14 rounded-full bg-sky-400/28 blur-[2px]" />
                  <div className="absolute h-10 w-10 rounded-full border-4 border-white/85 bg-sky-500/22" />
                  {locationStatus === 'granted' ? (
                    <div className="relative h-6 w-6 rounded-full border-[3px] border-white bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.36),0_14px_34px_rgba(14,165,233,0.5)]" />
                  ) : (
                    <div className="relative h-6 w-6 rounded-full border-[3px] border-white bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.34),0_14px_34px_rgba(37,99,235,0.48)]" />
                  )}
                </div>
              </MarkerContent>
              <MarkerTooltip>{resolvedDestination.label}</MarkerTooltip>
            </MapMarker>
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
