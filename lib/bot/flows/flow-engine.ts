import type { BotThread } from '@/lib/bot/types';
import { stepHandlerRegistry } from '../steps/step-handler-registry';
import type { Step } from '../steps/step-types';
import { flowRegistry } from './flow-registry';
import type { Flow, FlowThreadState } from './flow-types';

/**
 * Core orchestrator for conversational flows.
 *
 * Responsibilities:
 * - Load and manage flow definitions
 * - Track current step and progress through a flow
 * - Handle input parsing and step transitions
 * - Validate transitions and enforce flow guards
 * - Call step-specific handlers for input parsing and UI rendering
 */
class FlowEngine {
  private resolveStepForRender(step: Step, state: FlowThreadState): Step {
    const resolvedPrompt = step.renderPrompt?.(state.data) ?? step.prompt;
    const resolvedContent = step.renderContent?.(state.data) ?? step.content;

    return {
      ...step,
      prompt: resolvedPrompt,
      content: resolvedContent,
    };
  }

  /**
   * Load a flow from the registry.
   */
  private getFlow(flowId: string): Flow {
    const flow = flowRegistry.get(flowId);
    if (!flow) {
      throw new Error(`Flow not registered: ${flowId}`);
    }
    return flow;
  }

  /**
   * Get the current step from thread state.
   */
  getCurrentStep(flow: Flow, state: FlowThreadState): Step {
    if (state.stepIndex < 0 || state.stepIndex >= flow.steps.length) {
      throw new Error(
        `Invalid step index ${state.stepIndex} for flow ${flow.id} with ${flow.steps.length} steps`
      );
    }
    return flow.steps[state.stepIndex];
  }

  /**
   * Determine if a flow is complete.
   */
  isFlowComplete(flow: Flow, state: FlowThreadState): boolean {
    return state.stepIndex >= flow.steps.length;
  }

  /**
   * Render the current step's UI.
   */
  async renderCurrentStep(
    thread: BotThread,
    flow: Flow,
    state: FlowThreadState
  ): Promise<void> {
    if (this.isFlowComplete(flow, state)) {
      // Flow complete, but this shouldn't be called
      console.warn(`Attempted to render step for completed flow: ${flow.id}`);
      return;
    }

    const step = this.getCurrentStep(flow, state);
    const renderedStep = this.resolveStepForRender(step, state);
    const handler = stepHandlerRegistry.get(renderedStep.type);

    await handler.render(thread, renderedStep);
  }

  /**
   * Handle user input for the current step.
   *
   * Returns:
   * - Updated thread state
   * - Response message to post
   * - Whether flow is complete
   */
  async handleStepInput(
    flow: Flow,
    state: FlowThreadState,
    input: unknown
  ): Promise<{
    nextState: FlowThreadState;
    response: string;
    isComplete: boolean;
  }> {
    // Get current step and handler
    const currentStep = this.getCurrentStep(flow, state);
    const handler = stepHandlerRegistry.get(currentStep.type);

    // Parse input
    const parseResult = await handler.parse(input, currentStep);

    if ('error' in parseResult) {
      // Validation failed - stay on same step
      return {
        nextState: state,
        response: parseResult.error,
        isComplete: false,
      };
    }

    // Parse succeeded - store value and determine next step
    const dataKey = currentStep.dataKey || currentStep.id;
    let updatedData = {
      ...state.data,
      [dataKey]: parseResult.value,
    };

    if (currentStep.onAfterParse) {
      const patch = await currentStep.onAfterParse(
        parseResult.value,
        updatedData,
        input
      );
      if (patch) {
        updatedData = {
          ...updatedData,
          ...patch,
        };
      }
    }

    // Determine next step
    let nextStepIndex = state.stepIndex + 1;

    if (currentStep.nextStep) {
      // Custom transition logic
      const nextStepId = currentStep.nextStep(updatedData);
      if (nextStepId) {
        const nextStep = flow.steps.find((s) => s.id === nextStepId);
        if (nextStep) {
          nextStepIndex = flow.steps.indexOf(nextStep);
        }
      }
    }

    // Check if flow is complete
    const isComplete = nextStepIndex >= flow.steps.length;

    const nextState: FlowThreadState = {
      flowId: state.flowId,
      flowVersion: state.flowVersion,
      stepIndex: nextStepIndex,
      data: updatedData,
      startedAt: state.startedAt,
      completedAt: isComplete ? Date.now() : undefined,
    };

    return {
      nextState,
      response: ``,
      isComplete,
    };
  }

  /**
   * Advance to the next step without consuming input.
   * Used for steps that don't require input (e.g., confirmations).
   */
  async advanceStep(
    state: FlowThreadState,
    _flow: Flow
  ): Promise<{
    nextState: FlowThreadState;
    isComplete: boolean;
  }> {
    const nextStepIndex = state.stepIndex + 1;
    const isComplete = nextStepIndex >= _flow.steps.length;

    return {
      nextState: {
        flowId: state.flowId,
        flowVersion: state.flowVersion,
        stepIndex: nextStepIndex,
        data: state.data,
        startedAt: state.startedAt,
        completedAt: isComplete ? Date.now() : undefined,
      },
      isComplete,
    };
  }

  /**
   * Create initial flow state.
   */
  createInitialState(flowId: string, flowVersion: number = 1): FlowThreadState {
    const flow = this.getFlow(flowId);

    // Find starting step index
    const startStepIndex = flow.steps.findIndex((s) => s.id === flow.startStep);

    if (startStepIndex === -1) {
      throw new Error(
        `Start step "${flow.startStep}" not found in flow ${flowId}`
      );
    }

    return {
      flowId,
      flowVersion,
      stepIndex: startStepIndex,
      data: {},
    };
  }
}

export const flowEngine = new FlowEngine();
