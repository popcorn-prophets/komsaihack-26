'use client';

import {
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from '@/components/control-center/map/map';
import { cn } from '@/lib/utils';

import {
  formatIncidentTime,
  getSeverityStyle,
  HEATMAP_LEGEND_COLORS,
} from './incident-map-scene.helpers';
import type {
  DestinationMarker,
  IncidentMarker,
  IncidentSeverity,
} from './incident-map-scene.types';

export function HeatmapLegend({ mobile = false }: { mobile?: boolean }) {
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

export function IncidentMarkerCard({ marker }: { marker: IncidentMarker }) {
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

export function IncidentMarkerVisual({
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
        />
      </div>
    </div>
  );
}

export function UserLocationMarker({
  destination,
  locationStatus,
}: {
  destination: DestinationMarker;
  locationStatus: 'idle' | 'requesting' | 'granted' | 'fallback';
}) {
  return (
    <MapMarker
      longitude={destination.longitude}
      latitude={destination.latitude}
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
      <MarkerTooltip>{destination.label}</MarkerTooltip>
    </MapMarker>
  );
}
