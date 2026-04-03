import type { BotThread } from '@/lib/bot/types';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

/**
 * Handler for confirmation steps.
 * Displays a summary and indicates completion.
 * Does not accept user input - just renders confirmation.
 */
export class ConfirmationHandler extends BaseStepHandler {
  type = 'confirmation' as const;

  parse(_data: unknown, _step: Step): { value: unknown } | { error: string } {
    void _data;
    void _step;

    // Confirmation steps don't parse user input
    return { value: null };
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { renderCard } = await import('../renderers/card-renderer');

    const prompt = step.prompt || 'Thank you!';

    await renderCard(thread, {
      title: prompt,
      content: 'Your information has been saved successfully.',
    });
  }
}

export const confirmationHandler = new ConfirmationHandler();
