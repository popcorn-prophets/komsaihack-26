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
    missingResidentMessage:
      'You need to complete onboarding before reporting incidents. Let us start your registration.',
    fallbackFlowId: 'onboarding',
  },

  steps: [
    {
      id: 'freeform_report',
      type: 'text',
      prompt:
        'Describe the incident in one message, or send a photo of the incident, or both. Include what happened, where it happened, and how urgent it is.',
      validations: [required, compose(minLength(15), maxLength(3000))],
      dataKey: 'freeformReportText',
      allowImageAttachments: true,
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
      prompt:
        'I could not map the location from your report. Please send your location pin or type a nearby place/address.',
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
      prompt: 'Please review your report before submission.',
      renderContent: (data) => {
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
          `Incident Type: ${incidentType}`,
          `Severity: ${severity}`,
          `Description: ${description}`,
          `Location: ${locationDescription}`,
          '',
          'Submit this report?',
        ].join('\n');
      },
      options: [
        { label: 'Confirm and Submit', value: 'confirm' },
        { label: 'Cancel', value: 'cancel' },
      ],
      validations: [required],
      dataKey: 'submissionDecision',
    },
  ],

  onComplete: async (data, thread: BotThread) => {
    try {
      const submissionDecision = data.submissionDecision;
      if (submissionDecision !== 'confirm') {
        const { renderCard } = await import('../renderers/card-renderer');
        await renderCard(thread, {
          title: 'Cancelled',
          content:
            'Incident reporting has been cancelled. Send "report" anytime to start again.',
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
        title: 'Report Submitted',
        content:
          'Your incident report has been received. Responders will review it as soon as possible.',
      });
    } catch (error) {
      console.error('Freeform incident reporting completion error:', error);

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: 'Error',
        content:
          error instanceof Error
            ? error.message
            : 'An error occurred while submitting your report. Please try again.',
      });

      throw error;
    }
  },

  onCancel: async (thread) => {
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: 'Cancelled',
      content:
        'Incident reporting has been cancelled. Send "report" anytime to start again.',
    });
  },
};
