import type { Point } from '@/types/geo';

export type GeocodingPoint = Point;

export interface GeocodingAddress {
  houseNumber?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
}

export interface GeocodingResult {
  displayName: string;
  point: GeocodingPoint;
  address?: GeocodingAddress;
  boundingBox?: [number, number, number, number];
  placeId?: number;
  osmType?: string;
  osmId?: number;
  category?: string;
  type?: string;
  importance?: number;
  raw: unknown;
}

export interface ForwardGeocodeOptions {
  language?: string;
  limit?: number;
  countryCodes?: string[];
  viewbox?: [number, number, number, number];
  bounded?: boolean;
  addressDetails?: boolean;
}

export interface ReverseGeocodeOptions {
  language?: string;
  zoom?: number;
  layer?: Array<'address' | 'poi' | 'railway' | 'natural' | 'manmade'>;
  addressDetails?: boolean;
}

export interface GeocodingAdapter {
  forwardGeocode(
    query: string,
    options?: ForwardGeocodeOptions
  ): Promise<GeocodingResult[]>;

  reverseGeocode(
    point: GeocodingPoint,
    options?: ReverseGeocodeOptions
  ): Promise<GeocodingResult | null>;
}
