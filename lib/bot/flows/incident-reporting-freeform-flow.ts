import { localizeIncidentSeverity, translate } from '@/lib/bot/i18n';
import type { BotThread } from '@/lib/bot/types';
import { toPoint } from '@/lib/geo';
import { createDefaultGeocodingService } from '@/lib/geocoding';
import {
  compose,
  isGeometryPoint,
  maxLength,
  minLength,
  required,
} from '../steps/validators';
import { getThreadLocale } from './flow-locale';
import type { Flow } from './flow-types';
import { parseFreeformIncidentReport } from './incident-ai-parser';
import {
  fetchIncidentTypeNames,
  isIncidentSeverity,
  submitIncidentReport,
} from './incident-reporting-service';

const geocodingService = createDefaultGeocodingService();

/**
 * Freeform incident reporting flow for onboarded residents.
 * Users describe the incident in plain language and AI parses structured fields.
 */
export const incidentReportingFreeformFlow: Flow = {
  id: 'incident-reporting-freeform',
  name: 'Incident Reporting (Freeform)',
  startStep: 'freeform_report',
  start: {
    commands: ['report freeform', 'report with ai', 'quick report'],
    requiresResident: true,
    missingResidentMessageKey: 'handler.missing_resident',
    fallbackFlowId: 'onboarding',
  },

  steps: [
    {
      id: 'freeform_report',
      type: 'text',
      renderPrompt: (_data, locale) =>
        translate('incident.freeform.prompt', locale),
      validations: [required, compose(minLength(15), maxLength(3000))],
      dataKey: 'freeformReportText',
      allowImageAttachments: true,
      allowAudioAttachments: true,
      onAfterParse: async (value, _data, input) => {
        if (typeof value !== 'string' && typeof value !== 'undefined') {
          throw new Error('Invalid report format. Please try again.');
        }

        const incidentTypeNames = await fetchIncidentTypeNames();
        const parsed = await parseFreeformIncidentReport({
          input,
          allowedIncidentTypeNames: incidentTypeNames,
        });

        let parsedLocation: ReturnType<typeof toPoint>;
        let needsLocationInput = false;

        try {
          const geocodingResults = await geocodingService.forwardGeocode(
            parsed.locationDescription,
            { limit: 1 }
          );
          const bestMatch = geocodingResults[0];
          if (bestMatch?.point) {
            parsedLocation = toPoint(bestMatch.point);
          } else {
            needsLocationInput = true;
          }
        } catch (error) {
          console.error('Freeform location geocoding error:', error);
          needsLocationInput = true;
        }

        return {
          parsedIncidentTypeName: parsed.incidentTypeName,
          parsedSeverity: parsed.severity,
          parsedDescription: parsed.description,
          parsedLocationDescription: parsed.locationDescription,
          ...(parsedLocation ? { parsedLocation } : {}),
          requiresLocationInput: needsLocationInput,
        };
      },
      nextStep: (data) => {
        const parsedLocation = toPoint(data.parsedLocation);
        if (parsedLocation) {
          return 'review_submission';
        }

        return 'location_input';
      },
    },
    {
      id: 'location_input',
      type: 'location',
      renderPrompt: (_data, locale) =>
        translate('incident.freeform.location.missing', locale),
      validations: [isGeometryPoint],
      dataKey: 'parsedLocation',
      resolveLocationDescription: true,
      onAfterParse: async (value) => {
        const parsedLocation = value as {
          locationDescription?: unknown;
        };

        if (typeof parsedLocation.locationDescription === 'string') {
          return {
            parsedLocationDescription: parsedLocation.locationDescription,
            requiresLocationInput: false,
          };
        }

        return {
          requiresLocationInput: false,
        };
      },
    },
    {
      id: 'review_submission',
      type: 'selection',
      renderPrompt: (_data, locale) =>
        translate('incident.prompt.review', locale),
      renderContent: (data, locale) => {
        const incidentType =
          typeof data.parsedIncidentTypeName === 'string'
            ? data.parsedIncidentTypeName
            : 'Unknown';
        const severity =
          typeof data.parsedSeverity === 'string'
            ? data.parsedSeverity
            : 'Unknown';
        const description =
          typeof data.parsedDescription === 'string'
            ? data.parsedDescription
            : 'Not provided';
        const locationDescription =
          typeof data.parsedLocationDescription === 'string'
            ? data.parsedLocationDescription
            : 'Not provided';

        return [
          `${translate('incident.review.incident_type_label', locale)}: ${incidentType}`,
          `${translate('incident.review.severity_label', locale)}: ${localizeIncidentSeverity(severity, locale)}`,
          `${translate('incident.review.description_label', locale)}: ${description}`,
          `${translate('incident.review.location_label', locale)}: ${locationDescription}`,
          '',
          translate('incident.review.submit_question', locale),
        ].join('\n');
      },
      renderOptions: (_data, locale) => [
        {
          label: translate('incident.review.confirm', locale),
          value: 'confirm',
        },
        { label: translate('incident.review.cancel', locale), value: 'cancel' },
      ],
      validations: [required],
      dataKey: 'submissionDecision',
    },
  ],

  onComplete: async (data, thread: BotThread) => {
    try {
      const locale = await getThreadLocale(thread);
      const submissionDecision = data.submissionDecision;
      if (submissionDecision !== 'confirm') {
        const { renderCard } = await import('../renderers/card-renderer');
        await renderCard(thread, {
          title: translate('incident.cancelled.title', locale),
          content: translate('incident.cancelled.message', locale),
        });
        return;
      }

      const incidentTypeName = data.parsedIncidentTypeName;
      const severity = data.parsedSeverity;
      const description = data.parsedDescription;
      const locationDescription = data.parsedLocationDescription;
      const parsedLocation = toPoint(data.parsedLocation);

      if (
        typeof incidentTypeName !== 'string' ||
        typeof severity !== 'string' ||
        typeof description !== 'string' ||
        typeof locationDescription !== 'string'
      ) {
        throw new Error(
          'Parsed report details are incomplete. Please try again.'
        );
      }

      if (!isIncidentSeverity(severity)) {
        throw new Error(
          'Unable to determine incident severity. Please try again.'
        );
      }

      await submitIncidentReport({
        thread,
        incidentTypeName,
        severity,
        description,
        location: parsedLocation,
        locationDescription,
      });

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate('incident.freeform.submitted.title', locale),
        content: translate('incident.freeform.submitted.message', locale),
      });
    } catch (error) {
      console.error('Freeform incident reporting completion error:', error);

      const locale = await getThreadLocale(thread);

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate('incident.error.title', locale),
        content: translate('incident.error.submit_fallback', locale),
      });

      throw error;
    }
  },

  onCancel: async (thread) => {
    const locale = await getThreadLocale(thread);
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: translate('incident.cancelled.title', locale),
      content: translate('incident.cancelled.message', locale),
    });
  },
};
