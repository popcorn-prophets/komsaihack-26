import type { BotThread } from '@/lib/bot/types';
import type { FlowThreadState } from '../flows/flow-types';
import { translate } from '../i18n';
import { BaseStepHandler } from './base-step';
import type { Step } from './step-types';

function hasImageAttachment(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const attachments = (data as { attachments?: unknown }).attachments;
  if (!Array.isArray(attachments)) {
    return false;
  }

  return attachments.some((attachment) => {
    if (!attachment || typeof attachment !== 'object') {
      return false;
    }

    const currentAttachment = attachment as {
      type?: unknown;
      mimeType?: unknown;
    };

    if (currentAttachment.type === 'image') {
      return true;
    }

    return (
      currentAttachment.type === 'file' &&
      typeof currentAttachment.mimeType === 'string' &&
      currentAttachment.mimeType.startsWith('image/')
    );
  });
}

function hasAudioAttachment(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const attachments = (data as { attachments?: unknown }).attachments;
  if (!Array.isArray(attachments)) {
    return false;
  }

  return attachments.some((attachment) => {
    if (!attachment || typeof attachment !== 'object') {
      return false;
    }

    const currentAttachment = attachment as {
      type?: unknown;
      mimeType?: unknown;
    };

    if (currentAttachment.type === 'audio') {
      return true;
    }

    return (
      currentAttachment.type === 'file' &&
      typeof currentAttachment.mimeType === 'string' &&
      currentAttachment.mimeType.startsWith('audio/')
    );
  });
}

const renderCardPromise = import('../renderers/card-renderer').then(
  (module) => module.renderCard
);

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

    const hasAttachedImage =
      step.allowImageAttachments && hasImageAttachment(data);
    const hasAttachedAudio =
      step.allowAudioAttachments && hasAudioAttachment(data);
    const hasAllowedAttachments = hasAttachedImage || hasAttachedAudio;

    if (!text || typeof text !== 'string') {
      if (hasAllowedAttachments) {
        return { value: '' };
      }

      return { error: 'Expected text input' };
    }

    // Validate the value unless this step is accepting image-only input.
    if (!hasAllowedAttachments) {
      const validationError = this.validateValue(text, step);
      if (validationError) {
        return { error: validationError };
      }
    }

    return { value: text };
  }

  async render(thread: BotThread, step: Step): Promise<void> {
    const renderCard = await renderCardPromise;

    const prompt = step.prompt || 'Please provide input';

    // Get locale from thread state if available
    const state = (await thread.state) as FlowThreadState | null;
    const locale = state?.locale;

    const content = translate('step.text.content', locale);

    await renderCard(thread, {
      title: prompt,
      content,
    });
  }
}

export const textInputHandler = new TextInputHandler();
