import type { BotThread } from '@/lib/bot/types';
import { createDefaultGeocodingService } from '@/lib/geocoding';
import type { Point } from '@/types/geo';
import type { FlowThreadState } from '../flows/flow-types';
import { translate } from '../i18n';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

const renderCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderCard
);

const geocodingService = createDefaultGeocodingService();

type ResolvedLocation = Point & {
  locationDescription?: string;
};

/**
 * Handler for location input steps.
 * Extracts location from raw message data (platform-specific).
 * Validates as GeoJSON Point geometry.
 */
export class LocationInputHandler extends BaseStepHandler {
  type = 'location' as const;

  async parse(
    data: unknown,
    step: Step,
    thread: BotThread
  ): Promise<{ value: unknown } | { error: string }> {
    // Get locale from thread state if available
    const state = (await thread.state) as FlowThreadState | null;
    const locale = state?.locale;

    // Try to extract location from message payload or raw event payload.
    const location = this.extractPresetLocation(data);

    if (location) {
      if (step.resolveLocationDescription) {
        try {
          const reverseResult = await geocodingService.reverseGeocode(location);
          if (!reverseResult?.displayName) {
            return {
              error: translate('step.location.resolve_error', locale),
            };
          }

          const resolvedLocation: ResolvedLocation = {
            ...location,
            locationDescription: reverseResult.displayName,
          };

          const validationError = this.validateValue(resolvedLocation, step);
          if (validationError) {
            return { error: validationError };
          }

          return { value: resolvedLocation };
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          return {
            error: translate('step.location.resolve_error', locale),
          };
        }
      }

      const validationError = this.validateValue(location, step);
      if (validationError) {
        return { error: validationError };
      }

      return { value: location };
    }

    const textInput = this.extractTextInput(data);
    if (!textInput) {
      return {
        error: translate('step.location.pin_error', locale),
      };
    }

    try {
      const geocodingResults = await geocodingService.forwardGeocode(
        textInput,
        {
          limit: 1,
        }
      );

      const bestMatch = geocodingResults[0];
      const geocodedLocation = bestMatch?.point;

      if (!geocodedLocation) {
        return {
          error: translate('step.location.address_error', locale),
        };
      }

      const resolvedLocation: ResolvedLocation = {
        ...geocodedLocation,
        ...(step.resolveLocationDescription && bestMatch?.displayName
          ? { locationDescription: bestMatch.displayName }
          : {}),
      };

      if (
        step.resolveLocationDescription &&
        !resolvedLocation.locationDescription
      ) {
        return {
          error: translate('step.location.resolve_error', locale),
        };
      }

      const validationError = this.validateValue(resolvedLocation, step);
      if (validationError) {
        return { error: validationError };
      }

      return { value: resolvedLocation };
    } catch (error) {
      console.error('Location geocoding error:', error);
      return {
        error: translate('step.location.resolve_error', locale),
      };
    }
  }

  private extractTextInput(payload: unknown): string | undefined {
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }

    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const text = (payload as { text?: unknown }).text;
    if (typeof text !== 'string') {
      return undefined;
    }

    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * Extract location from message payload.
   * Supports current Chat message shape and Telegram raw payload variants.
   */
  private extractPresetLocation(payload: unknown): Point | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const messageLike = payload as {
      location?: { latitude?: number; longitude?: number };
      raw?: unknown;
      message?: {
        location?: { latitude?: number; longitude?: number };
      };
    };

    const rawLike = messageLike.raw as
      | {
          location?: { latitude?: number; longitude?: number };
          message?: {
            location?: { latitude?: number; longitude?: number };
          };
        }
      | undefined;

    const locationCandidate =
      messageLike.location ||
      messageLike.message?.location ||
      rawLike?.location ||
      rawLike?.message?.location;

    const rawWithLocation = {
      location: locationCandidate,
    } as {
      location?: { latitude?: number; longitude?: number };
    };

    const lat = rawWithLocation.location?.latitude;
    const lng = rawWithLocation.location?.longitude;

    if (typeof lat === 'number' && typeof lng === 'number') {
      return {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    return undefined;
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    const renderCard = await renderCardPromise;

    const prompt = step.prompt || translate('step.location.prompt');

    // Get locale from thread state if available
    const state = (await thread.state) as FlowThreadState | null;
    const locale = state?.locale;

    const content = translate('step.location.content', locale);

    await renderCard(thread, {
      title: prompt,
      content,
    });
  }
}

export const locationInputHandler = new LocationInputHandler();
