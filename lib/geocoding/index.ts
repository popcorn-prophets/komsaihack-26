import { createNominatimGeocodingAdapter } from './nominatim';
import { createGeocodingService } from './service';

export { createNominatimGeocodingAdapter } from './nominatim';
export { createGeocodingService } from './service';
export * from './types';

export function createDefaultGeocodingService() {
  return createGeocodingService(
    createNominatimGeocodingAdapter({
      baseUrl: process.env.NOMINATIM_BASE_URL,
      email: process.env.NOMINATIM_EMAIL,
      userAgent: process.env.NOMINATIM_USER_AGENT,
    })
  );
}
