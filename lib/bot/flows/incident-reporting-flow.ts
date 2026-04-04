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
    missingResidentMessage:
      'You need to complete onboarding before reporting incidents. Let us start your registration.',
    fallbackFlowId: 'onboarding',
  },
  onStart: async () => {
    await hydrateIncidentReportingFlowOptions();
  },

  steps: [
    {
      id: 'incident_type',
      type: 'selection',
      prompt: 'What type of incident are you reporting?',
      options: [],
      validations: [required],
      dataKey: 'incidentTypeName',
    },
    {
      id: 'severity',
      type: 'selection',
      prompt: 'How severe is the incident right now?',
      options: INCIDENT_SEVERITY_OPTIONS,
      validations: [required],
      dataKey: 'severity',
    },
    {
      id: 'description',
      type: 'text',
      prompt: 'Please describe what happened.',
      validations: [required, compose(minLength(10), maxLength(1200))],
      dataKey: 'description',
    },
    {
      id: 'location',
      type: 'location',
      prompt: 'Please share the location of the incident.',
      validations: [isGeometryPoint],
      dataKey: 'location',
      resolveLocationDescription: true,
    },
    {
      id: 'review_submission',
      type: 'selection',
      prompt: 'Please review your report before submission.',
      renderContent: (data) => {
        const incidentType =
          typeof data.incidentTypeName === 'string'
            ? data.incidentTypeName
            : 'Unknown';
        const severity =
          typeof data.severity === 'string' ? data.severity : 'Unknown';
        const description =
          typeof data.description === 'string'
            ? data.description
            : 'Not provided';

        const locationPoint = data.location as
          | {
              type?: unknown;
              coordinates?: unknown;
              locationDescription?: unknown;
            }
          | undefined;

        const locationSummary =
          typeof locationPoint?.locationDescription === 'string'
            ? locationPoint.locationDescription
            : locationPoint?.type === 'Point' &&
                Array.isArray(locationPoint.coordinates) &&
                typeof locationPoint.coordinates[0] === 'number' &&
                typeof locationPoint.coordinates[1] === 'number'
              ? `${locationPoint.coordinates[1]}, ${locationPoint.coordinates[0]}`
              : 'Not provided';

        return [
          `Incident Type: ${incidentType}`,
          `Severity: ${severity}`,
          `Description: ${description}`,
          `Location: ${locationSummary}`,
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

  /**
   * Called when incident reporting flow completes successfully.
   * Inserts incident record into database.
   */
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
        title: 'Report Submitted',
        content:
          'Your incident report has been received. Responders will review it as soon as possible.',
      });
    } catch (error) {
      console.error('Incident reporting completion error:', error);

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

  /**
   * Called when incident reporting is cancelled.
   */
  onCancel: async (thread) => {
    const { renderCard } = await import('../renderers/card-renderer');
    await renderCard(thread, {
      title: 'Cancelled',
      content:
        'Incident reporting has been cancelled. Send "report" anytime to start again.',
    });
  },
};
