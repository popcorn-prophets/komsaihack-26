import { Point } from '@/types/geo';

export function pointToString(point: Point): string {
  return `POINT(${point.coordinates[0]} ${point.coordinates[1]})`;
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

function isHexString(value: string) {
  return /^[0-9a-f]+$/i.test(value);
}

function hexToBytes(hex: string) {
  const length = hex.length;
  if (length % 2 !== 0) return null;
  const bytes = new Uint8Array(length / 2);
  for (let i = 0; i < length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) return null;
    bytes[i / 2] = byte;
  }
  return bytes;
}

function readUInt32(view: DataView, offset: number, littleEndian: boolean) {
  return view.getUint32(offset, littleEndian);
}

function readFloat64(view: DataView, offset: number, littleEndian: boolean) {
  return view.getFloat64(offset, littleEndian);
}

/**
 * Convert Supabase PostGIS geography/geometry values into map coordinates.
 * Supports:
 * - GeoJSON object: { type: 'Point', coordinates: [lng, lat] }
 * - WKT string: 'POINT(lng lat)'
 * - EWKB hex string for POINT (with/without SRID flag)
 */
export function toCoordinates(value: unknown): {
  longitude: number | null;
  latitude: number | null;
} {
  const point = toPoint(value);
  if (point) {
    const [longitude, latitude] = point.coordinates;
    return { longitude, latitude };
  }

  if (typeof value !== 'string') return { longitude: null, latitude: null };

  const match = value.match(
    /^POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i
  );
  if (match) {
    return {
      longitude: Number(match[1]),
      latitude: Number(match[2]),
    };
  }

  // EWKB (hex) - common Supabase serialization for geography/geometry
  if (!isHexString(value) || value.length < 42) {
    return { longitude: null, latitude: null };
  }

  const bytes = hexToBytes(value);
  if (!bytes || bytes.length < 21) {
    return { longitude: null, latitude: null };
  }

  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const byteOrder = view.getUint8(0);
    const littleEndian = byteOrder === 1;
    const type = readUInt32(view, 1, littleEndian);
    const hasSrid = (type & 0x20000000) !== 0;
    const geometryType = type & 0xff;

    // 1 == Point
    if (geometryType !== 1) {
      return { longitude: null, latitude: null };
    }

    const coordinateOffset = hasSrid ? 9 : 5;
    if (bytes.length < coordinateOffset + 16) {
      return { longitude: null, latitude: null };
    }

    return {
      longitude: readFloat64(view, coordinateOffset, littleEndian),
      latitude: readFloat64(view, coordinateOffset + 8, littleEndian),
    };
  } catch {
    return { longitude: null, latitude: null };
  }
}
