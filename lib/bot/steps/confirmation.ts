import type { BotThread } from '@/lib/bot/types';
import type { FlowThreadState } from '../flows/flow-types';
import { translate } from '../i18n';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

const renderCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderCard
);

const renderSelectionCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderSelectionCard
);

function extractActionValue(data: unknown): string | undefined {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const value = (data as { value?: unknown }).value;
  return typeof value === 'string' ? value : undefined;
}

function resolveInteractiveDecision(value: string): string | undefined {
  if (value === 'confirm' || value === 'cancel' || value === 'edit') {
    return value;
  }

  return undefined;
}

/**
 * Handler for confirmation steps.
 * Supports auto-complete confirmations and interactive edit/review confirmations.
 */
export class ConfirmationHandler extends BaseStepHandler {
  type = 'confirmation' as const;

  parse(
    data: unknown,
    step: Step
  ): { value: unknown } | { error: string } {
    const confirmation = step.confirmation;

    if (!confirmation || confirmation.mode !== 'interactive') {
      return { value: null };
    }

    const value = extractActionValue(data);
    if (!value) {
      return { error: 'Expected selection value' };
    }

    const resolvedDecision = resolveInteractiveDecision(value);
    if (!resolvedDecision) {
      return {
        error: 'Invalid selection. Please choose one of the available options.',
      };
    }

    const validationError = this.validateValue(resolvedDecision, step);
    if (validationError) {
      return { error: validationError };
    }

    return { value: resolvedDecision };
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    const confirmation = step.confirmation;
    const state = (await thread.state) as FlowThreadState | null;
    const locale = state?.locale;

    if (!confirmation || confirmation.mode !== 'interactive') {
      const renderCard = await renderCardPromise;
      const prompt = step.prompt || translate('step.confirmation.prompt', locale);
      const content = step.content || translate('step.confirmation.message', locale);

      await renderCard(thread, {
        title: prompt,
        content,
      });
      return;
    }

    const renderSelectionCard = await renderSelectionCardPromise;
    const prompt = step.prompt || translate('step.confirmation.prompt', locale);
    const confirmLabel = confirmation.confirmLabel ?? 'Confirm and Submit';
    const cancelLabel = confirmation.cancelLabel ?? 'Cancel';
    const editLabel = confirmation.editLabel ?? 'Edit';

    await renderSelectionCard(thread, {
      title: prompt,
      content: step.content,
      options: [
        { label: confirmLabel, value: 'confirm' },
        { label: editLabel, value: 'edit' },
        { label: cancelLabel, value: 'cancel' },
      ],
    });
  }
}

export const confirmationHandler = new ConfirmationHandler();
