import { Step } from '../steps/step-types';
import { BotThread } from '../types';

export type FlowData = Record<string, unknown>;

/**
 * Represents the complete definition of a conversational flow.
 * Flows are composed of ordered steps and define entry/exit behavior.
 */
export interface Flow {
  /** Unique flow identifier */
  id: string;

  /** Human-readable name of the flow */
  name: string;

  /** Ordered list of steps */
  steps: Step[];

  /** ID of the first step */
  startStep: string;

  /**
   * Called when flow is completed successfully.
   * Receives collected data from all steps.
   */
  onComplete: (data: FlowData, thread: BotThread) => Promise<void>;

  /**
   * Optional: Called when flow is cancelled/abandoned.
   */
  onCancel?: (thread: BotThread) => Promise<void>;
}

/**
 * Thread state for tracking flow progress.
 * Decoupled from individual step names to allow flow modifications.
 */
export interface FlowThreadState {
  /** ID of the current flow */
  flowId: string;

  /** Version of the flow (for handling flow definition changes) */
  flowVersion: number;

  /** Index of the current step in flow.steps */
  stepIndex: number;

  /** Data collected so far: { [stepId]: value, ... } */
  data: FlowData;

  /** Optional: timestamp when flow was started */
  startedAt?: number;

  /** Optional: timestamp when flow was completed */
  completedAt?: number;
}
