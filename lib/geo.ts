import { Point } from '@/types/geo';

export function pointToString(point: Point): string {
  return `POINT(${point.coordinates[0]} ${point.coordinates[1]})`;
}

export function parsePointWkt(value: unknown): Point | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const match = value
    .trim()
    .match(
      /^POINT\s*\(\s*([+-]?(?:\d+\.?\d*|\.\d+))\s+([+-]?(?:\d+\.?\d*|\.\d+))\s*\)$/i
    );
  if (!match) {
    return undefined;
  }

  const lng = Number(match[1]);
  const lat = Number(match[2]);
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return undefined;
  }

  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

export function toPoint(value: unknown): Point | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const point = value as { type?: unknown; coordinates?: unknown };
  if (point.type !== 'Point' || !Array.isArray(point.coordinates)) {
    return undefined;
  }

  const [lng, lat] = point.coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return undefined;
  }

  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}
