import type { BotInstance } from '@/lib/bot/chat';
import { flowEngine } from '@/lib/bot/flows/flow-engine';
import { flowRegistry } from '@/lib/bot/flows/flow-registry';
import type { Flow, FlowThreadState } from '@/lib/bot/flows/flow-types';
import type { BotThread } from '@/lib/bot/types';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Register message handlers for the bot.
 */
export function registerMessageHandlers(bot: BotInstance) {
  async function resolveFlowContext(thread: BotThread): Promise<{
    state: FlowThreadState;
    flow: Flow;
  } | null> {
    const state = (await thread.state) as FlowThreadState | null;
    if (!state) {
      await thread.post('An error occurred. Please start over.');
      return null;
    }

    const flow = flowRegistry.get(state.flowId);
    if (!flow) {
      console.error(`Flow not registered: ${state.flowId}`);
      await thread.post('An error occurred. Please try again.');
      return null;
    }

    return { state, flow };
  }

  async function continueFlowAfterTransition(
    thread: BotThread,
    flow: Flow,
    state: FlowThreadState
  ): Promise<void> {
    let currentState = state;

    if (flowEngine.isFlowComplete(flow, currentState)) {
      try {
        await flow.onComplete(currentState.data, thread);
      } catch (error) {
        console.error('Error in flow.onComplete:', error);
      }
      return;
    }

    while (!flowEngine.isFlowComplete(flow, currentState)) {
      const currentStep = flowEngine.getCurrentStep(flow, currentState);

      await flowEngine.renderCurrentStep(thread, flow, currentState);

      if (currentStep.type !== 'confirmation') {
        return;
      }

      const advanced = await flowEngine.advanceStep(currentState, flow);
      currentState = advanced.nextState;
      await thread.setState(currentState);

      if (advanced.isComplete) {
        try {
          await flow.onComplete(currentState.data, thread);
        } catch (error) {
          console.error('Error in flow.onComplete:', error);
        }
        return;
      }
    }
  }

  async function processFlowInput(
    thread: BotThread,
    input: unknown,
    options?: { requireSelectionStep?: boolean }
  ): Promise<void> {
    const context = await resolveFlowContext(thread);
    if (!context) return;

    const { state, flow } = context;

    if (flowEngine.isFlowComplete(flow, state)) {
      await thread.post('The flow is already complete.');
      return;
    }

    if (options?.requireSelectionStep) {
      const currentStep = flowEngine.getCurrentStep(flow, state);
      if (currentStep.type !== 'selection') {
        return;
      }
    }

    const result = await flowEngine.handleStepInput(flow, state, input);

    if (result.response) {
      await thread.post(result.response);
    }

    await thread.setState(result.nextState);
    await continueFlowAfterTransition(thread, flow, result.nextState);
  }

  /**
   * Handle new mentions: Check if resident exists, start onboarding if not.
   */
  bot.onNewMention(async (thread) => {
    await thread.subscribe();

    try {
      const supabase = createAdminClient();

      // Check if resident already exists
      const { data, error } = await supabase
        .from('residents')
        .select('id')
        .eq('thread_id', thread.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error checking resident:', error);
        await thread.post('An error occurred. Please try again.');
        return;
      }

      if (data) {
        // Resident already onboarded
        await thread.post('Welcome back!');
      } else {
        // Start onboarding flow
        const initialState: FlowThreadState =
          flowEngine.createInitialState('onboarding');
        await thread.setState(initialState);

        // Render first step
        const flow = flowRegistry.get('onboarding');
        if (!flow) {
          console.error('Onboarding flow not registered');
          await thread.post('An error occurred. Please try again.');
          return;
        }

        await flowEngine.renderCurrentStep(thread, flow, initialState);
      }
    } catch (error) {
      console.error('Error in onNewMention handler:', error);
      await thread.post('An unexpected error occurred. Please try again.');
    }
  });

  /**
   * Handle messages in subscribed threads: Route through active flow.
   */
  bot.onSubscribedMessage(async (thread, message) => {
    try {
      // Allow user to stop the bot
      if (message.text === 'stop') {
        await thread.post('Goodbye!');
        await thread.unsubscribe();
        return;
      }

      await processFlowInput(thread as BotThread, message);
    } catch (error) {
      console.error('Error processing message:', error);
      await thread.post('An error occurred. Please try again.');
    }
  });

  /**
   * Handle action events (e.g., button clicks).
   */
  bot.onAction(async (event) => {
    if (!event.thread) {
      console.warn('No thread in action event');
      return;
    }

    try {
      await processFlowInput(event.thread as BotThread, event, {
        requireSelectionStep: true,
      });
    } catch (error) {
      console.error('Error handling action event:', error);
      await event.thread.post('An error occurred. Please try again.');
    }
  });
}
