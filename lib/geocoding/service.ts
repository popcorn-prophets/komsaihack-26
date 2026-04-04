import type {
  ForwardGeocodeOptions,
  GeocodingAdapter,
  GeocodingPoint,
  GeocodingResult,
  ReverseGeocodeOptions,
} from './types';

export interface GeocodingService {
  forwardGeocode(
    query: string,
    options?: ForwardGeocodeOptions
  ): Promise<GeocodingResult[]>;

  reverseGeocode(
    point: GeocodingPoint,
    options?: ReverseGeocodeOptions
  ): Promise<GeocodingResult | null>;
}

export function createGeocodingService(
  adapter: GeocodingAdapter
): GeocodingService {
  return {
    forwardGeocode: (query, options) => adapter.forwardGeocode(query, options),
    reverseGeocode: (point, options) => adapter.reverseGeocode(point, options),
  };
}
