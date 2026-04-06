import type { ExpressionSpecification } from 'maplibre-gl';

import type { IncidentSeverity } from './incident-map-scene.types';

type SeverityStyle = {
  weight: number;
  haloClassName: string;
  markerClassName: string;
  iconWrapperClassName: string;
  iconClassName: string;
  badgeClassName: string;
};

const DEFAULT_SEVERITY_STYLE: SeverityStyle = {
  weight: 0.35,
  haloClassName: 'h-14 w-14 bg-slate-400/24',
  markerClassName:
    'h-7 w-7 bg-slate-500 shadow-[0_12px_32px_rgba(100,116,139,0.35)]',
  iconWrapperClassName: 'h-4 w-4',
  iconClassName: 'h-2.5 w-2.5',
  badgeClassName: 'bg-slate-500',
};

const SEVERITY_STYLES: Record<IncidentSeverity, SeverityStyle> = {
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

export const MARKER_VISIBILITY_ZOOM = 13;
export const HEATMAP_FADE_END_ZOOM = 14;

export const HEATMAP_COLOR_RAMP: ExpressionSpecification = [
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

export const HEATMAP_LEGEND_COLORS = [
  '#fff5a3',
  '#ffcc66',
  '#f97316',
  '#ea580c',
  '#dc2626',
];

export function getSeverityStyle(severity?: IncidentSeverity | null) {
  if (!severity) return DEFAULT_SEVERITY_STYLE;

  return SEVERITY_STYLES[severity] ?? DEFAULT_SEVERITY_STYLE;
}

export function getSeverityWeight(severity?: IncidentSeverity | null) {
  return getSeverityStyle(severity).weight;
}

export function formatIncidentTime(incidentTime?: string | null) {
  return incidentTime
    ? new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Manila',
      }).format(new Date(incidentTime))
    : 'No incident time';
}
