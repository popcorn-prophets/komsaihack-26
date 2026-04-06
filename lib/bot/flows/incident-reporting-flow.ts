import type { ResidentLocale } from '@/lib/bot/i18n';
import { localizeIncidentSeverity, translate } from '@/lib/bot/i18n';
import type { BotThread } from '@/lib/bot/types';
import type { Point } from '@/types/geo';
import { Constants, type Enums } from '@/types/supabase';
import type { SelectionOption, Step } from '../steps/step-types';
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
import {
  fetchIncidentTypeNames,
  submitIncidentReport,
} from './incident-reporting-service';

type IncidentSeverity = Enums<'incident_severity'>;

const INCIDENT_SEVERITIES = Constants.public.Enums
  .incident_severity as readonly IncidentSeverity[];

const INCIDENT_SEVERITY_OPTIONS: SelectionOption[] = INCIDENT_SEVERITIES.map(
  (severity) => ({
    label: `${severity.charAt(0).toUpperCase()}${severity.slice(1)}`,
    value: severity,
  })
);

function getSelectionStepById(flow: Flow, stepId: string): Step {
  const step = flow.steps.find((currentStep) => currentStep.id === stepId);
  if (!step || step.type !== 'selection') {
    throw new Error(`Expected selection step not found: ${stepId}`);
  }
  return step;
}

function getLocationSummary(data: Record<string, unknown>): string {
  const locationPoint = data.location as
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

const incidentReviewFields = [
  {
    targetStepId: 'incident_type',
    label: 'Incident Type',
    dataKey: 'incidentTypeName',
  },
  {
    targetStepId: 'severity',
    label: 'Severity',
    dataKey: 'severity',
  },
  {
    targetStepId: 'description',
    label: 'Description',
    dataKey: 'description',
  },
  {
    targetStepId: 'location',
    label: 'Location',
    dataKey: 'location',
    renderValue: (data: Record<string, unknown>) => getLocationSummary(data),
  },
];

const incidentReviewSteps = createEditableConfirmationStep({
  id: 'review_submission',
  prompt: 'Please review your report before submission.',
  editPrompt: 'Select the field you want to edit.',
  confirmLabel: 'Confirm and Submit',
  cancelLabel: 'Cancel',
  editLabel: 'Edit',
  fields: incidentReviewFields,
  footer: 'Select a field to edit, cancel the report, or confirm to submit.',
});

const [incidentReviewStep, incidentReviewEditStep] = incidentReviewSteps;

async function hydrateIncidentReportingFlowOptions(): Promise<void> {
  const incidentTypeNames = await fetchIncidentTypeNames();

  const incidentTypeOptions: SelectionOption[] = incidentTypeNames.map(
    (incidentTypeName) => ({
      label: incidentTypeName,
      value: incidentTypeName,
    })
  );

  if (incidentTypeOptions.length === 0) {
    throw new Error(
      'No incident types are configured yet. Please contact support.'
    );
  }

  const incidentTypeStep = getSelectionStepById(
    incidentReportingFlow,
    'incident_type'
  );
  incidentTypeStep.options = incidentTypeOptions;

  const severityStep = getSelectionStepById(incidentReportingFlow, 'severity');
  severityStep.options = INCIDENT_SEVERITY_OPTIONS;
}

function localizeIncidentReviewStep(locale: ResidentLocale): void {
  const localizedFields = [
    {
      targetStepId: 'incident_type',
      label: translate('incident.review.incident_type_label', locale),
      dataKey: 'incidentTypeName',
    },
    {
      targetStepId: 'severity',
      label: translate('incident.review.severity_label', locale),
      dataKey: 'severity',
    },
    {
      targetStepId: 'description',
      label: translate('incident.review.description_label', locale),
      dataKey: 'description',
    },
    {
      targetStepId: 'location',
      label: translate('incident.review.location_label', locale),
      dataKey: 'location',
      renderValue: (data: Record<string, unknown>) => getLocationSummary(data),
    },
  ];

  incidentReviewStep.prompt = translate('incident.prompt.review', locale);
  incidentReviewStep.confirmation = {
    ...(incidentReviewStep.confirmation ?? {}),
    fields: localizedFields,
    confirmLabel: translate('incident.review.confirm', locale),
    cancelLabel: translate('incident.review.cancel', locale),
    editLabel: translate('incident.review.edit', locale),
    footer: translate('incident.review.footer', locale),
  };
  incidentReviewStep.renderContent = (data, renderLocale) =>
    buildEditableConfirmationSummary(
      localizedFields,
      data,
      translate('incident.review.footer', renderLocale)
    );
  incidentReviewEditStep.prompt = translate(
    'incident.review.edit_prompt',
    locale
  );
  incidentReviewEditStep.options = localizedFields.map((field, index) => ({
    label: field.label,
    value: `f${index}`,
  }));
}

/**
 * Incident reporting flow for onboarded residents.
 */
export const incidentReportingFlow: Flow = {
  id: 'incident-reporting',
  name: 'Incident Reporting',
  startStep: 'incident_type',
  start: {
    commands: ['report', 'report incident', 'incident'],
    requiresResident: true,
    missingResidentMessageKey: 'handler.missing_resident',
    fallbackFlowId: 'onboarding',
  },
  onStart: async (thread) => {
    await hydrateIncidentReportingFlowOptions();
    const locale = await getThreadLocale(thread);
    localizeIncidentReviewStep(locale);
  },

  steps: [
    {
      id: 'incident_type',
      type: 'selection',
      renderPrompt: (_data, locale) =>
        translate('incident.prompt.type', locale),
      options: [],
      validations: [required],
      dataKey: 'incidentTypeName',
    },
    {
      id: 'severity',
      type: 'selection',
      renderPrompt: (_data, locale) =>
        translate('incident.prompt.severity', locale),
      renderOptions: (_data, locale) =>
        INCIDENT_SEVERITIES.map((severity) => ({
          label: localizeIncidentSeverity(severity, locale),
          value: severity,
        })),
      options: INCIDENT_SEVERITY_OPTIONS,
      validations: [required],
      dataKey: 'severity',
    },
    {
      id: 'description',
      type: 'text',
      renderPrompt: (_data, locale) =>
        translate('incident.prompt.description', locale),
      validations: [required, compose(minLength(10), maxLength(1200))],
      dataKey: 'description',
    },
    {
      id: 'location',
      type: 'location',
      renderPrompt: (_data, locale) =>
        translate('incident.prompt.location', locale),
      validations: [isGeometryPoint],
      dataKey: 'location',
      resolveLocationDescription: true,
    },
    ...incidentReviewSteps,
  ],

  /**
   * Called when incident reporting flow completes successfully.
   * Inserts incident record into database.
   */
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

      const incidentTypeName = data.incidentTypeName;
      const severity = data.severity;
      const description = data.description;
      const location = data.location;

      if (!incidentTypeName || !severity || !description || !location) {
        throw new Error(
          `Incomplete incident report. Missing: ${[
            !incidentTypeName ? 'incident type' : '',
            !severity ? 'severity' : '',
            !description ? 'description' : '',
            !location ? 'location' : '',
          ]
            .filter(Boolean)
            .join(', ')}`
        );
      }

      if (typeof incidentTypeName !== 'string') {
        throw new Error('Invalid incident type format.');
      }

      if (typeof severity !== 'string') {
        throw new Error('Invalid severity format.');
      }

      if (typeof description !== 'string') {
        throw new Error('Invalid description format.');
      }

      if (!location || typeof location !== 'object') {
        throw new Error('Invalid location format.');
      }

      const point = location as {
        type?: unknown;
        coordinates?: unknown;
        locationDescription?: unknown;
      };
      if (point.type !== 'Point' || !Array.isArray(point.coordinates)) {
        throw new Error('Invalid location format.');
      }

      const [lng, lat] = point.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Invalid location format.');
      }

      const normalizedLocation: Point = {
        type: 'Point',
        coordinates: [lng, lat],
      };

      const locationDescription =
        typeof point.locationDescription === 'string'
          ? point.locationDescription
          : undefined;

      await submitIncidentReport({
        thread,
        incidentTypeName,
        severity: severity as IncidentSeverity,
        description,
        location: normalizedLocation,
        locationDescription,
      });

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate('incident.submitted.title', locale),
        content: translate('incident.submitted.message', locale),
      });
    } catch (error) {
      console.error('Incident reporting completion error:', error);

      const locale = await getThreadLocale(thread);

      const { renderCard } = await import('../renderers/card-renderer');
      await renderCard(thread, {
        title: translate('incident.error.title', locale),
        content: translate('incident.error.submit_fallback', locale),
      });
      throw error;
    }
  },

  /**
   * Called when incident reporting is cancelled.
   */
  onCancel: async (thread) => {
    const locale = await getThreadLocale(thread);
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: translate('incident.cancelled.title', locale),
      content: translate('incident.cancelled.message', locale),
    });
  },
};
