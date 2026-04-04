import type { BotThread } from '@/lib/bot/types';
import { FlowData } from '../flows/flow-types';

/**
 * Validator function for step input validation.
 * Returns error message if invalid, undefined if valid.
 */
export type Validator = (value: unknown) => string | undefined;

/**
 * Step type determines how input is parsed and how the UI is rendered.
 */
export type StepType = 'text' | 'selection' | 'location' | 'confirmation';

/**
 * Option for selection-type steps.
 */
export interface SelectionOption {
  label: string;
  value: string;
}

/**
 * Represents a single step in a conversation flow.
 * Steps are reusable building blocks that can be composed into flows.
 */
export interface Step {
  /** Unique identifier within the flow */
  id: string;

  /** Step type determines parsing and UI rendering */
  type: StepType;

  /** Display text for the step prompt */
  prompt?: string;

  /** Optional display content/body for the step */
  content?: string;

  /** Build prompt from collected flow data at render time */
  renderPrompt?: (data: FlowData) => string | undefined;

  /** Build content/body from collected flow data at render time */
  renderContent?: (data: FlowData) => string | undefined;

  /** For selection steps, the available options */
  options?: SelectionOption[];

  /** Validation rules applied to user input */
  validations?: Validator[];

  /**
   * Determines which step to transition to based on collected data.
   * If undefined, uses sequential ordering in flow.steps.
   */
  nextStep?: (data: FlowData) => string | undefined;

  /** Optional field key to store value under (defaults to step.id) */
  dataKey?: string;

  /**
   * Optional async hook invoked after successful parse.
   * Returned patch is merged into collected flow data.
   */
  onAfterParse?: (
    value: unknown,
    data: FlowData
  ) => Promise<Partial<FlowData> | void>;
}

/**
 * Handler for processing step input validation and transitions.
 * Implementations are responsible for parsing raw message data into typed values.
 */
export interface StepHandler {
  /** Step type this handler processes */
  type: StepType;

  /**
   * Parse and validate user input from a message.
   * @param data Current step or message data
   * @param step Step definition for context
   */
  parse(data: unknown, step: Step): { value: unknown } | { error: string };

  /**
   * Render the step's prompt/UI.
   * @param thread Thread to post message to
   * @param step Step definition
   */
  render(thread: BotThread, step: Step): Promise<void>;
}
