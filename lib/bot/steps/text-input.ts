import type { BotThread } from '@/lib/bot/types';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

/**
 * Handler for text input steps.
 * Parses message.text and validates with step validators.
 */
export class TextInputHandler extends BaseStepHandler {
  type = 'text' as const;

  parse(data: unknown, step: Step): { value: unknown } | { error: string } {
    // Extract text from message
    const text =
      typeof data === 'string'
        ? data
        : ((data as { text?: unknown })?.text as unknown);

    if (!text || typeof text !== 'string') {
      return { error: 'Expected text input' };
    }

    // Validate the value
    const validationError = this.validateValue(text, step);
    if (validationError) {
      return { error: validationError };
    }

    return { value: text };
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { renderCard } = await import('../renderers/card-renderer');

    const prompt = step.prompt || 'Please provide input';

    await renderCard(thread, {
      title: prompt,
      content: `Please provide ${step.id}`,
    });
  }
}

export const textInputHandler = new TextInputHandler();
