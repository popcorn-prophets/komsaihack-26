import type { Point } from '@/types/geo';
import type {
  ForwardGeocodeOptions,
  GeocodingAdapter,
  GeocodingAddress,
  GeocodingResult,
  ReverseGeocodeOptions,
} from './types';

export interface NominatimAdapterOptions {
  baseUrl?: string;
  email?: string;
  userAgent?: string;
  fetchImpl?: typeof fetch;
}

interface NominatimSearchItem {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
  address?: Record<string, string | undefined>;
  category?: string;
  type?: string;
  importance?: number;
}

interface NominatimReverseResponse {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
  address?: Record<string, string | undefined>;
  category?: string;
  type?: string;
  importance?: number;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

function mapAddress(
  address?: Record<string, string | undefined>
): GeocodingAddress | undefined {
  if (!address) {
    return undefined;
  }

  return {
    houseNumber: address.house_number,
    road: address.road,
    neighbourhood: address.neighbourhood,
    suburb: address.suburb,
    city: address.city,
    town: address.town,
    village: address.village,
    municipality: address.municipality,
    county: address.county,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    countryCode: address.country_code,
  };
}

function mapSearchItem(
  item: NominatimSearchItem | NominatimReverseResponse
): GeocodingResult {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);

  return {
    displayName: item.display_name,
    point: {
      type: 'Point',
      coordinates: [longitude, latitude],
    } satisfies Point,
    address: mapAddress(item.address),
    boundingBox: item.boundingbox
      ? [
          Number(item.boundingbox[2]),
          Number(item.boundingbox[0]),
          Number(item.boundingbox[3]),
          Number(item.boundingbox[1]),
        ]
      : undefined,
    placeId: item.place_id,
    osmType: item.osm_type,
    osmId: item.osm_id,
    category: item.category,
    type: item.type,
    importance: item.importance,
    raw: item,
  };
}

function buildSearchParams(
  query: string,
  options: ForwardGeocodeOptions = {}
): URLSearchParams {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: options.addressDetails === false ? '0' : '1',
    limit: String(Math.min(Math.max(options.limit ?? 5, 1), 40)),
  });

  if (options.language) {
    params.set('accept-language', options.language);
  }

  if (options.countryCodes?.length) {
    params.set('countrycodes', options.countryCodes.join(','));
  }

  if (options.viewbox) {
    params.set('viewbox', options.viewbox.join(','));
  }

  if (options.bounded) {
    params.set('bounded', '1');
  }

  return params;
}

function buildReverseParams(
  point: Point,
  options: ReverseGeocodeOptions = {}
): URLSearchParams {
  const params = new URLSearchParams({
    lat: String(point.coordinates[1]),
    lon: String(point.coordinates[0]),
    format: 'jsonv2',
    addressdetails: options.addressDetails === false ? '0' : '1',
    zoom: String(Math.min(Math.max(options.zoom ?? 18, 0), 18)),
  });

  if (options.language) {
    params.set('accept-language', options.language);
  }

  if (options.layer?.length) {
    params.set('layer', options.layer.join(','));
  }

  return params;
}

export function createNominatimGeocodingAdapter(
  options: NominatimAdapterOptions = {}
): GeocodingAdapter {
  const baseUrl = normalizeBaseUrl(
    options.baseUrl ?? 'https://nominatim.openstreetmap.org'
  );
  const fetchImpl = options.fetchImpl ?? fetch;
  const userAgent = options.userAgent ?? 'project-hermes-geocoding';

  async function requestJson<T>(url: string): Promise<T> {
    const response = await fetchImpl(url, {
      headers: {
        'User-Agent': userAgent,
        ...(options.email ? { From: options.email } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim request failed with status ${response.status}`
      );
    }

    return (await response.json()) as T;
  }

  return {
    async forwardGeocode(query, forwardOptions) {
      const url = `${baseUrl}/search?${buildSearchParams(query, forwardOptions)}`;
      const results = await requestJson<NominatimSearchItem[]>(url);
      return results.map(mapSearchItem);
    },

    async reverseGeocode(point, reverseOptions) {
      const url = `${baseUrl}/reverse?${buildReverseParams(point, reverseOptions)}`;
      const result = await requestJson<
        NominatimReverseResponse & { error?: string }
      >(url);

      if ('error' in result) {
        return null;
      }

      return mapSearchItem(result);
    },
  };
}
