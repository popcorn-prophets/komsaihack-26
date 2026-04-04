import type { Step } from '../steps/step-types';
import { required } from '../steps/validators';
import type { FlowData } from './flow-types';

export const COMPLETE_FLOW_STEP_ID = '__flow_complete__';

export interface EditableConfirmationField {
  targetStepId: string;
  label: string;
  dataKey?: string;
  renderValue?: (data: FlowData) => string;
}

export interface CreateEditableConfirmationStepOptions {
  id: string;
  prompt: string;
  fields: EditableConfirmationField[];
  editPrompt?: string;
  footer?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  editLabel?: string;
  dataKey?: string;
}

function getFieldValue(
  field: EditableConfirmationField,
  data: FlowData
): string {
  if (field.renderValue) {
    return field.renderValue(data);
  }

  const value = data[field.dataKey ?? field.targetStepId];
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return 'Not provided';
    }
  }

  return 'Not provided';
}

export function buildEditableConfirmationSummary(
  fields: EditableConfirmationField[],
  data: FlowData,
  footer: string = 'Select a field to edit, or confirm to submit.'
): string {
  return [
    ...fields.map((field) => `${field.label}: ${getFieldValue(field, data)}`),
    '',
    footer,
  ].join('\n');
}

export function createEditableConfirmationStep(
  options: CreateEditableConfirmationStepOptions
): Step[] {
  const footer =
    options.footer ?? 'Select a field to edit, or confirm to submit.';
  const dataKey = options.dataKey ?? 'submissionDecision';
  const editStepId = `${options.id}_edit_field`;

  const editFieldOptions = options.fields.map((field, index) => ({
    label: field.label,
    value: `f${index}`,
  }));

  return [
    {
      id: options.id,
      type: 'confirmation',
      prompt: options.prompt,
      dataKey,
      validations: [required],
      confirmation: {
        mode: 'interactive',
        fields: options.fields,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        editLabel: options.editLabel,
        footer,
      },
      nextStep: (data) => {
        const decision = data[dataKey];

        if (decision === 'edit') {
          return editStepId;
        }

        if (decision === 'confirm' || decision === 'cancel') {
          return COMPLETE_FLOW_STEP_ID;
        }

        return undefined;
      },
      renderContent: (data) =>
        buildEditableConfirmationSummary(options.fields, data, footer),
    },
    {
      id: editStepId,
      type: 'selection',
      prompt: options.editPrompt ?? 'Which field would you like to edit?',
      options: editFieldOptions,
      validations: [required],
      dataKey: `${dataKey}EditField`,
      onAfterParse: async (value) => {
        if (typeof value !== 'string' || !value.startsWith('f')) {
          return;
        }

        const fieldIndex = Number(value.slice(1));
        if (!Number.isInteger(fieldIndex) || fieldIndex < 0) {
          return;
        }

        const field = options.fields[fieldIndex];
        if (!field) {
          return;
        }

        return {
          [dataKey]: `edit:${field.targetStepId}`,
        };
      },
      nextStep: (data) => {
        const decision = data[dataKey];

        if (typeof decision !== 'string') {
          return undefined;
        }

        if (!decision.startsWith('edit:')) {
          return undefined;
        }

        const targetStepId = decision.slice('edit:'.length).trim();
        return targetStepId.length > 0 ? targetStepId : undefined;
      },
    },
  ];
}
