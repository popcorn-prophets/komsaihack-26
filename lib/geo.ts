import { Point } from '@/types/geo';

export function pointToString(point: Point): string {
  return `POINT(${point.coordinates[0]} ${point.coordinates[1]})`;
}
