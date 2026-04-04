import type { BotThread } from '@/lib/bot/types';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

const renderSelectionCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderSelectionCard
);

/**
 * Handler for selection steps (buttons/actions).
 * Parses action event values and validates against available options.
 */
export class SelectionHandler extends BaseStepHandler {
  type = 'selection' as const;

  parse(data: unknown, step: Step): { value: unknown } | { error: string } {
    // Extract value from action event or selection data
    const eventValue = (data as { value?: unknown })?.value;
    const value = eventValue || data;

    if (!value || typeof value !== 'string') {
      return { error: 'Expected selection value' };
    }

    // Validate the value is in available options
    if (step.options) {
      const isValidOption = step.options.some((opt) => opt.value === value);
      if (!isValidOption) {
        return {
          error: `Invalid selection. Must be one of: ${step.options.map((o) => o.value).join(', ')}`,
        };
      }
    }

    // Apply additional validators
    const validationError = this.validateValue(value, step);
    if (validationError) {
      return { error: validationError };
    }

    return { value };
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    const renderSelectionCard = await renderSelectionCardPromise;

    const options = step.options || [];

    const prompt = step.prompt || 'Please select an option';

    await renderSelectionCard(thread, {
      title: prompt,
      options,
    });
  }
}

export const selectionHandler = new SelectionHandler();
