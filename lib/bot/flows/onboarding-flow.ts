import {
  DEFAULT_LOCALE,
  getLocaleLabel,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  translate,
} from '@/lib/bot/i18n';
import type { ResidentLocale } from '@/lib/bot/i18n/types';
import type { BotThread } from '@/lib/bot/types';
import { pointToString } from '@/lib/geo';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/supabase';
import {
  compose,
  isGeometryPoint,
  isOneOf,
  maxLength,
  minLength,
  required,
} from '../steps/validators';
import type { Flow } from './flow-types';

type ResidentLanguage = Database['public']['Enums']['resident_language'];

/**
 * Onboarding flow for new residents.
 */
export const onboardingFlow: Flow = {
  id: 'onboarding',
  name: 'Resident Onboarding',
  startStep: 'language',
  start: {
    autoStartForUnregisteredResident: true,
  },

  steps: [
    {
      id: 'language',
      type: 'selection',
      renderPrompt: (_data, locale) =>
        translate('onboarding.prompt.language', locale),
      options: SUPPORTED_LOCALES.map((localeCode) => ({
        label: getLocaleLabel(localeCode),
        value: localeCode,
      })),
      validations: [isOneOf([...SUPPORTED_LOCALES])],
      dataKey: 'language',
    },
    {
      id: 'name',
      type: 'text',
      renderPrompt: (_data, locale) =>
        translate('onboarding.prompt.name', locale),
      validations: [required, compose(minLength(2), maxLength(100))],
      dataKey: 'name',
    },
    {
      id: 'location',
      type: 'location',
      renderPrompt: (_data, locale) =>
        translate('onboarding.prompt.location', locale),
      validations: [isGeometryPoint],
      dataKey: 'location',
    },
    {
      id: 'confirm',
      type: 'confirmation',
      renderPrompt: (_data, locale) =>
        translate('onboarding.prompt.confirm', locale),
    },
  ],

  /**
   * Called when onboarding flow completes successfully.
   * Inserts resident record into database.
   */
  onComplete: async (data, thread: BotThread) => {
    try {
      const language = data.language;
      const name = data.name;
      const location = data.location;

      // Validate required fields
      if (!language || !name || !location) {
        throw new Error(
          `Incomplete onboarding data. Missing: ${[
            !language ? 'language' : '',
            !name ? 'name' : '',
            !location ? 'location' : '',
          ]
            .filter(Boolean)
            .join(', ')}`
        );
      }

      if (typeof name !== 'string') {
        throw new Error('Invalid name format.');
      }
      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location format.');
      }

      const point = location as { type?: unknown; coordinates?: unknown };
      if (point.type !== 'Point' || !Array.isArray(point.coordinates)) {
        throw new Error('Invalid location format.');
      }

      const [lng, lat] = point.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Invalid location format.');
      }

      const normalizedLocation = {
        type: 'Point' as const,
        coordinates: [lng, lat] as [number, number],
      };

      const supabase = createAdminClient();

      const selectedLanguage = language as ResidentLanguage;

      const { data: existingResident, error: existingResidentError } =
        await supabase
          .from('residents')
          .select('id, language')
          .eq('thread_id', thread.id)
          .maybeSingle();

      if (existingResidentError) {
        console.error(
          'Failed to read existing resident:',
          existingResidentError
        );
        throw new Error('Failed to save your data. Please try again later.');
      }

      if (!existingResident) {
        const { error: insertError } = await supabase.from('residents').insert({
          platform: thread.adapter.name as 'telegram' | 'messenger',
          platform_user_id: thread.id,
          thread_id: thread.id,
          name,
          language: selectedLanguage,
          location: pointToString(normalizedLocation),
        });

        if (insertError) {
          console.error('Failed to insert resident:', insertError);
          throw new Error('Failed to save your data. Please try again later.');
        }
      } else if (existingResident.language !== selectedLanguage) {
        const { error: updateLanguageError } = await supabase
          .from('residents')
          .update({ language: selectedLanguage })
          .eq('id', existingResident.id);

        if (updateLanguageError) {
          console.error(
            'Failed to update resident language:',
            updateLanguageError
          );
          throw new Error('Failed to save your data. Please try again later.');
        }
      }

      // Render success message using card renderer in the resident's selected language
      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate(
          'onboarding.success.title',
          language as ResidentLocale
        ),
        content: translate(
          'onboarding.success.message',
          language as ResidentLocale
        ),
      });
    } catch (error) {
      console.error('Onboarding completion error:', error);

      const locale = isSupportedLocale(data.language)
        ? data.language
        : DEFAULT_LOCALE;

      // Render error message using card renderer
      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate('incident.error.title', locale),
        content: translate('error.onboarding.fallback', locale),
      });
      throw error;
    }
  },

  /**
   * Called when onboarding is cancelled.
   */
  onCancel: async (thread) => {
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: translate('onboarding.cancel.title', DEFAULT_LOCALE),
      content: translate('onboarding.cancel.message', DEFAULT_LOCALE),
    });
  },
};
