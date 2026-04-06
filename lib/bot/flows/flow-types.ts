import type { MessageKey, ResidentLocale } from '../i18n/types';
import { Step } from '../steps/step-types';
import { BotThread } from '../types';

export type FlowData = Record<string, unknown>;

/**
 * Optional start behavior metadata for flow discovery and guard handling.
 */
export interface FlowStartConfig {
  /** Commands that should start this flow, e.g. "report" */
  commands?: string[];

  /** Automatically start this flow for users without a resident profile */
  autoStartForUnregisteredResident?: boolean;

  /** Whether the flow requires an existing resident profile */
  requiresResident?: boolean;

  /** Message shown when resident requirement is not met */
  missingResidentMessage?: string;

  /** i18n key shown when resident requirement is not met */
  missingResidentMessageKey?: MessageKey;

  /** Fallback flow to start when resident requirement is not met */
  fallbackFlowId?: string;
}

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

  /** Optional startup behavior metadata */
  start?: FlowStartConfig;

  /**
   * Optional hook invoked before the flow is started.
   * Useful for hydrating dynamic step options.
   */
  onStart?: (thread: BotThread) => Promise<void>;

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

  /** Temporary return target used by edit detours (e.g., back to confirmation). */
  pendingReturnStepId?: string;

  /** Resident's preferred locale for message rendering */
  locale: ResidentLocale;

  /** Optional: timestamp when flow was started */
  startedAt?: number;

  /** Optional: timestamp when flow was completed */
  completedAt?: number;
}
