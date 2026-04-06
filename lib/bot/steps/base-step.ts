import type { BotThread } from '@/lib/bot/types';
import type { Step, StepHandler, StepType } from './step-types';

/**
 * Base class for step handlers.
 * Provides common functionality for all step types.
 */
export abstract class BaseStepHandler implements StepHandler {
  abstract type: StepType;

  /**
   * Parse user input into a typed value.
   * Subclasses should override to implement type-specific parsing.
   */
  abstract parse(
    data: unknown,
    step: Step,
    thread?: BotThread
  ):
    | { value: unknown }
    | { error: string }
    | Promise<{ value: unknown } | { error: string }>;

  /**
   * Render the step prompt/UI.
   * Subclasses should override to implement type-specific rendering.
   */
  abstract render(thread: BotThread, step: Step): Promise<void>;

  /**
   * Validate a value against the step's validators.
   * Shared implementation for all step types.
   */
  protected validateValue(value: unknown, step: Step): string | undefined {
    if (!step.validations) return undefined;

    for (const validator of step.validations) {
      const error = validator(value);
      if (error) return error;
    }

    return undefined;
  }

  /**
   * Get the data key for storing the value.
   * Defaults to step.id if dataKey not specified.
   */
  protected getDataKey(step: Step): string {
    return step.dataKey || step.id;
  }
}
