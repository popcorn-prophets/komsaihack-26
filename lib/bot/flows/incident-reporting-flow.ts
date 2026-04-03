import type { BotThread } from '@/lib/bot/types';
import { pointToString } from '@/lib/geo';
import { createAdminClient } from '@/lib/supabase/admin';
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
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('incident_types')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to load incident types:', error);
    throw new Error(
      'Incident types are currently unavailable. Please try again.'
    );
  }

  const incidentTypeOptions: SelectionOption[] =
    data?.map((incidentType) => ({
      label: incidentType.name,
      value: incidentType.name,
    })) ?? [];

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
    },
    {
      id: 'confirm',
      type: 'confirmation',
      prompt: 'Submitting your report...',
    },
  ],

  /**
   * Called when incident reporting flow completes successfully.
   * Inserts incident record into database.
   */
  onComplete: async (data, thread: BotThread) => {
    try {
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

      const point = location as { type?: unknown; coordinates?: unknown };
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

      const supabase = createAdminClient();

      const { data: resident, error: residentError } = await supabase
        .from('residents')
        .select('id')
        .eq('thread_id', thread.id)
        .maybeSingle();

      if (residentError) {
        console.error(
          'Failed to resolve resident for incident report:',
          residentError
        );
        throw new Error('Failed to identify your account. Please try again.');
      }

      if (!resident) {
        throw new Error(
          'You need to complete onboarding before reporting incidents.'
        );
      }

      const { data: incidentType, error: incidentTypeError } = await supabase
        .from('incident_types')
        .select('id')
        .eq('name', incidentTypeName)
        .maybeSingle();

      if (incidentTypeError) {
        console.error('Failed to resolve incident type:', incidentTypeError);
        throw new Error('Failed to process incident type. Please try again.');
      }

      if (!incidentType) {
        throw new Error(
          'Selected incident type is no longer available. Please try again.'
        );
      }

      const { error: insertError } = await supabase.from('incidents').insert({
        reported_by: resident.id,
        incident_type_id: incidentType.id,
        severity: severity as IncidentSeverity,
        description,
        location: pointToString(normalizedLocation),
      });

      if (insertError) {
        console.error('Failed to insert incident report:', insertError);
        throw new Error(
          'Failed to submit your report. Please try again later.'
        );
      }

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
