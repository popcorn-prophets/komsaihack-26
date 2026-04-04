import type { BotThread } from '@/lib/bot/types';
import type { Point } from '@/types/geo';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

const renderCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderCard
);

/**
 * Handler for location input steps.
 * Extracts location from raw message data (platform-specific).
 * Validates as GeoJSON Point geometry.
 */
export class LocationInputHandler extends BaseStepHandler {
  type = 'location' as const;

  parse(data: unknown, step: Step): { value: unknown } | { error: string } {
    // Try to extract location from message payload or raw event payload.
    const location = this.extractLocation(data);

    if (!location) {
      return { error: 'Could not extract location from message' };
    }

    // Validate as GeoJSON Point
    const validationError = this.validateValue(location, step);
    if (validationError) {
      return { error: validationError };
    }

    return { value: location };
  }

  /**
   * Extract location from message payload.
   * Supports current Chat message shape and Telegram raw payload variants.
   */
  private extractLocation(payload: unknown): Point | undefined {
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

    const prompt = step.prompt || 'Please share your location';

    await renderCard(thread, {
      title: prompt,
      content: 'Send your location to proceed.',
    });
  }
}

export const locationInputHandler = new LocationInputHandler();
