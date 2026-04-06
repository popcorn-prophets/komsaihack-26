import type { ResidentLocale } from '@/lib/bot/i18n';
import { localizeIncidentSeverity, translate } from '@/lib/bot/i18n';
import type { BotThread } from '@/lib/bot/types';
import { parsePointWkt, toPoint } from '@/lib/geo';
import { createDefaultGeocodingService } from '@/lib/geocoding';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  compose,
  isGeometryPoint,
  maxLength,
  minLength,
  required,
} from '../steps/validators';
import {
  buildEditableConfirmationSummary,
  createEditableConfirmationStep,
} from './confirmation-step';
import { getThreadLocale } from './flow-locale';
import type { Flow } from './flow-types';
import { parseFreeformIncidentReport } from './incident-ai-parser';
import {
  fetchIncidentTypeNames,
  isIncidentSeverity,
  submitIncidentReport,
} from './incident-reporting-service';

const geocodingService = createDefaultGeocodingService();

async function resolveResidentHomeContext(
  thread: BotThread,
  locale: ResidentLocale
): Promise<string | undefined> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('residents')
    .select('location')
    .eq('thread_id', thread.id)
    .maybeSingle();

  if (error) {
    console.error(
      'Failed to load resident location for freeform parsing:',
      error
    );
    return undefined;
  }

  const residentLocation =
    parsePointWkt(data?.location) ?? toPoint(data?.location);

  if (!residentLocation) {
    return undefined;
  }

  try {
    const result = await geocodingService.reverseGeocode(residentLocation, {
      language: locale,
      addressDetails: true,
    });

    return result?.displayName?.trim() || undefined;
  } catch (error) {
    console.error('Failed to reverse geocode resident home location:', error);
    return undefined;
  }
}

function getFreeformLocationSummary(data: Record<string, unknown>): string {
  const locationPoint = data.parsedLocation as
    | {
        type?: unknown;
        coordinates?: unknown;
        locationDescription?: unknown;
      }
    | undefined;

  if (typeof locationPoint?.locationDescription === 'string') {
    return locationPoint.locationDescription;
  }

  if (
    locationPoint?.type === 'Point' &&
    Array.isArray(locationPoint.coordinates) &&
    typeof locationPoint.coordinates[0] === 'number' &&
    typeof locationPoint.coordinates[1] === 'number'
  ) {
    return `${locationPoint.coordinates[1]}, ${locationPoint.coordinates[0]}`;
  }

  return 'Not provided';
}

const freeformReviewSteps = createEditableConfirmationStep({
  id: 'review_submission',
  prompt: 'Please review your report before submission.',
  editPrompt: 'Select the field you want to edit.',
  confirmLabel: 'Confirm and Submit',
  cancelLabel: 'Cancel',
  editLabel: 'Edit',
  fields: [
    {
      targetStepId: 'freeform_report',
      label: 'Report Details',
      dataKey: 'freeformReportText',
      renderValue: (data: Record<string, unknown>) => {
        const incidentType =
          typeof data.parsedIncidentTypeName === 'string'
            ? data.parsedIncidentTypeName
            : 'Unknown';
        const severity =
          typeof data.parsedSeverity === 'string'
            ? localizeIncidentSeverity(data.parsedSeverity, 'eng')
            : 'Unknown';
        const description =
          typeof data.parsedDescription === 'string'
            ? data.parsedDescription
            : 'Not provided';
        const locationDescription = getFreeformLocationSummary(data);

        return [
          `Type: ${incidentType}`,
          `Severity: ${severity}`,
          `Description: ${description}`,
          `Location: ${locationDescription}`,
        ].join(' | ');
      },
    },
  ],
  footer: 'Select a field to edit, cancel the report, or confirm to submit.',
});

const [freeformReviewStep, freeformReviewEditStep] = freeformReviewSteps;

function localizeFreeformReviewStep(locale: ResidentLocale): void {
  const localizedFields = [
    {
      targetStepId: 'freeform_report',
      label: translate('incident.freeform.review.report_label', locale),
      dataKey: 'freeformReportText',
      renderValue: (data: Record<string, unknown>) => {
        const incidentType =
          typeof data.parsedIncidentTypeName === 'string'
            ? data.parsedIncidentTypeName
            : 'Unknown';
        const severity =
          typeof data.parsedSeverity === 'string'
            ? localizeIncidentSeverity(data.parsedSeverity, locale)
            : 'Unknown';
        const description =
          typeof data.parsedDescription === 'string'
            ? data.parsedDescription
            : 'Not provided';
        const locationDescription = getFreeformLocationSummary(data);

        return [
          `${translate('incident.review.incident_type_label', locale)}: ${incidentType}`,
          `${translate('incident.review.severity_label', locale)}: ${severity}`,
          `${translate('incident.review.description_label', locale)}: ${description}`,
          `${translate('incident.review.location_label', locale)}: ${locationDescription}`,
        ].join('\n');
      },
    },
  ];

  freeformReviewStep.prompt = translate('incident.prompt.review', locale);
  freeformReviewStep.confirmation = {
    ...(freeformReviewStep.confirmation ?? {}),
    fields: localizedFields,
    confirmLabel: translate('incident.review.confirm', locale),
    cancelLabel: translate('incident.review.cancel', locale),
    editLabel: translate('incident.review.edit', locale),
    footer: translate('incident.review.footer', locale),
  };
  freeformReviewStep.renderContent = (data, renderLocale) =>
    buildEditableConfirmationSummary(
      localizedFields,
      data,
      translate('incident.review.footer', renderLocale)
    );
  freeformReviewEditStep.prompt = translate(
    'incident.review.edit_prompt',
    locale
  );
  freeformReviewEditStep.options = localizedFields.map((field, index) => ({
    label: field.label,
    value: `f${index}`,
  }));
}

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
  onStart: async (thread) => {
    const locale = await getThreadLocale(thread);
    localizeFreeformReviewStep(locale);
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
      onAfterParse: async (value, _data, input, thread) => {
        if (typeof value !== 'string' && typeof value !== 'undefined') {
          throw new Error('Invalid report format. Please try again.');
        }

        const locale = thread ? await getThreadLocale(thread) : 'eng';
        const residentHomeContext = thread
          ? await resolveResidentHomeContext(thread, locale)
          : undefined;

        const incidentTypeNames = await fetchIncidentTypeNames();
        const parsed = await parseFreeformIncidentReport({
          input,
          allowedIncidentTypeNames: incidentTypeNames,
          residentHomeContext,
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
    ...freeformReviewSteps,
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
