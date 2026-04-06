import type { BotThread } from '@/lib/bot/types';
import {
  getResidentLanguageLabel,
  isResidentLanguage,
  RESIDENT_LANGUAGE_OPTIONS,
  RESIDENT_LANGUAGE_VALUES,
} from '@/lib/residents/languages';
import type { Point } from '@/types/geo';
import {
  compose,
  isGeometryPoint,
  isOneOf,
  maxLength,
  minLength,
  required,
} from '../steps/validators';
import type { Flow } from './flow-types';
import {
  updateResidentThreadSetting,
  type ResidentSettingsEditableField,
} from './resident-thread-settings-service';

const LANGUAGE_OPTIONS = RESIDENT_LANGUAGE_OPTIONS;

const EDITABLE_FIELD_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Language', value: 'language' },
  { label: 'Location of Residence', value: 'location' },
  { label: 'Cancel', value: 'cancel' },
];

function isEditableField(
  value: unknown
): value is ResidentSettingsEditableField {
  return value === 'name' || value === 'language' || value === 'location';
}

/**
 * Resident thread settings flow.
 * Lets onboarded residents update a single profile field and return to idle.
 */
export const residentThreadSettingsFlow: Flow = {
  id: 'resident-thread-settings',
  name: 'Resident Thread Settings',
  startStep: 'field',
  start: {
    commands: ['settings', 'profile', 'edit profile', 'update profile'],
    requiresResident: true,
    missingResidentMessage:
      'You need to complete onboarding before updating your settings. Let us start your registration.',
    fallbackFlowId: 'onboarding',
  },

  steps: [
    {
      id: 'field',
      type: 'selection',
      prompt: 'Which detail would you like to update?',
      options: [...EDITABLE_FIELD_OPTIONS],
      validations: [
        required,
        isOneOf(['name', 'language', 'location', 'cancel']),
      ],
      dataKey: 'field',
      nextStep: (data) => {
        const selectedField = data.field;

        if (selectedField === 'name') {
          return 'name';
        }

        if (selectedField === 'language') {
          return 'language';
        }

        if (selectedField === 'location') {
          return 'location';
        }

        return 'done';
      },
    },
    {
      id: 'name',
      type: 'text',
      prompt: 'What is your updated name?',
      validations: [required, compose(minLength(2), maxLength(100))],
      dataKey: 'name',
      nextStep: () => 'done',
    },
    {
      id: 'language',
      type: 'selection',
      prompt: 'What is your updated preferred language?',
      options: [...LANGUAGE_OPTIONS],
      validations: [required, isOneOf([...RESIDENT_LANGUAGE_VALUES])],
      dataKey: 'language',
      nextStep: () => 'done',
    },
    {
      id: 'location',
      type: 'location',
      prompt: 'Where is your updated residence location?',
      validations: [isGeometryPoint],
      dataKey: 'location',
      nextStep: () => 'done',
    },
    {
      id: 'done',
      type: 'confirmation',
      prompt: 'Saving your update...',
    },
  ],

  onComplete: async (data, thread: BotThread) => {
    try {
      const selectedField = data.field;

      if (selectedField === 'cancel') {
        const { renderCard } = await import('../renderers/card-renderer');
        await renderCard(thread, {
          title: 'No Changes Made',
          content: 'Your settings were not changed.',
        });
        return;
      }

      if (!isEditableField(selectedField)) {
        throw new Error('Invalid settings field selected.');
      }

      let valueToUpdate: string | Point;
      const successTitle = 'Settings Updated';
      let successContent = '';

      if (selectedField === 'name') {
        if (typeof data.name !== 'string') {
          throw new Error('Updated name was not provided.');
        }
        valueToUpdate = data.name;
        successContent = `Your name is now set to ${data.name}.`;
      } else if (selectedField === 'language') {
        if (!isResidentLanguage(data.language)) {
          throw new Error('Updated language was not provided.');
        }
        valueToUpdate = data.language;
        successContent = `Your preferred language is now ${getResidentLanguageLabel(
          data.language
        )}.`;
      } else {
        if (!data.location || typeof data.location !== 'object') {
          throw new Error('Updated location was not provided.');
        }
        const location = data.location as {
          type?: unknown;
          coordinates?: unknown;
        };
        if (location.type !== 'Point' || !Array.isArray(location.coordinates)) {
          throw new Error('Updated location is invalid.');
        }

        const [lng, lat] = location.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          throw new Error('Updated location is invalid.');
        }

        valueToUpdate = {
          type: 'Point',
          coordinates: [lng, lat],
        };
        successContent = 'Your residence location has been updated.';
      }

      await updateResidentThreadSetting({
        thread,
        field: selectedField,
        value: valueToUpdate,
      });

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: successTitle,
        content: successContent,
      });
    } catch (error) {
      console.error('Resident settings completion error:', error);

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: 'Error',
        content:
          error instanceof Error
            ? error.message
            : 'An error occurred while updating your settings. Please try again.',
      });
      throw error;
    }
  },

  onCancel: async (thread) => {
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: 'Cancelled',
      content: 'Settings update has been cancelled.',
    });
  },
};
