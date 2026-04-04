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
  function normalizeText(input: unknown): string {
    return typeof input === 'string' ? input.trim().toLowerCase() : '';
  }

  async function getResidentByThreadId(thread: BotThread): Promise<{
    id: string;
  } | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('residents')
      .select('id')
      .eq('thread_id', thread.id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error checking resident:', error);
      throw new Error('An error occurred while checking your profile.');
    }

    return data;
  }

  function buildAvailableCommandHint(): string {
    const commands = flowRegistry.getStartCommands();

    if (commands.length === 0) {
      return 'Send a supported command to begin.';
    }

    return `Send "${commands.join('", "')}" to begin.`;
  }

  async function startFlow(
    thread: BotThread,
    flow: Flow,
    context: { hasResident: boolean },
    visitedFlowIds: Set<string> = new Set()
  ): Promise<boolean> {
    if (visitedFlowIds.has(flow.id)) {
      console.error(`Detected cyclic flow fallback while starting ${flow.id}`);
      await thread.post('An error occurred. Please try again.');
      return false;
    }

    visitedFlowIds.add(flow.id);

    if (flow.start?.requiresResident && !context.hasResident) {
      if (flow.start.missingResidentMessage) {
        await thread.post(flow.start.missingResidentMessage);
      }

      const fallbackFlowId = flow.start.fallbackFlowId;
      if (!fallbackFlowId) {
        return false;
      }

      const fallbackFlow = flowRegistry.get(fallbackFlowId);
      if (!fallbackFlow) {
        console.error(`Fallback flow not registered: ${fallbackFlowId}`);
        await thread.post('An error occurred. Please try again.');
        return false;
      }

      return startFlow(thread, fallbackFlow, context, visitedFlowIds);
    }

    if (flow.onStart) {
      await flow.onStart(thread);
    }

    const initialState: FlowThreadState = flowEngine.createInitialState(
      flow.id
    );
    await thread.setState(initialState);
    await flowEngine.renderCurrentStep(thread, flow, initialState);
    return true;
  }

  async function handleFlowStartCommand(
    thread: BotThread,
    input: unknown,
    context: { hasResident: boolean }
  ): Promise<boolean> {
    if (typeof input !== 'string') {
      return false;
    }

    const resolved = flowRegistry.resolveStartCommandInput(input);
    if (!resolved) {
      return false;
    }

    const started = await startFlow(thread, resolved.flow, context);
    if (!started || !resolved.payload) {
      return started;
    }

    const state = (await thread.state) as FlowThreadState | null;
    if (!state) {
      return started;
    }

    const currentStep = flowEngine.getCurrentStep(resolved.flow, state);
    if (currentStep.type !== 'text') {
      return started;
    }

    await processFlowInput(thread, resolved.payload);
    return true;
  }

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

  async function ensureSelectionStepOptions(
    thread: BotThread,
    flow: Flow,
    state: FlowThreadState
  ): Promise<void> {
    if (flowEngine.isFlowComplete(flow, state)) {
      return;
    }

    const currentStep = flowEngine.getCurrentStep(flow, state);
    if (currentStep.type !== 'selection') {
      return;
    }

    if ((currentStep.options?.length ?? 0) > 0) {
      return;
    }

    if (flow.onStart) {
      await flow.onStart(thread);
    }
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
      await ensureSelectionStepOptions(thread, flow, currentState);

      const currentStep = flowEngine.getCurrentStep(flow, currentState);

      await flowEngine.renderCurrentStep(thread, flow, currentState);

      if (
        currentStep.type !== 'confirmation' ||
        currentStep.confirmation?.mode === 'interactive'
      ) {
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

    await ensureSelectionStepOptions(thread, flow, state);

    if (flowEngine.isFlowComplete(flow, state)) {
      await thread.post('The flow is already complete.');
      return;
    }

    if (options?.requireSelectionStep) {
      const currentStep = flowEngine.getCurrentStep(flow, state);
      if (
        currentStep.type !== 'selection' &&
        currentStep.type !== 'confirmation'
      ) {
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
      const resident = await getResidentByThreadId(thread);
      const hasResident = Boolean(resident);
      const autoStartFlow = hasResident
        ? undefined
        : flowRegistry.getAutoStartForUnregisteredResident();

      if (autoStartFlow) {
        await startFlow(thread, autoStartFlow, { hasResident });
        return;
      }

      await thread.post(hasResident ? 'Welcome back!' : 'Welcome!');
      await thread.post(buildAvailableCommandHint());
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
      const userText = typeof message.text === 'string' ? message.text : '';

      // Allow user to stop the bot
      if (normalizeText(userText) === 'stop') {
        await thread.post('Goodbye!');
        await thread.unsubscribe();
        return;
      }

      const resident = await getResidentByThreadId(thread as BotThread);
      const hasResident = Boolean(resident);

      if (
        await handleFlowStartCommand(thread as BotThread, userText, {
          hasResident,
        })
      ) {
        return;
      }

      const state = (await thread.state) as FlowThreadState | null;

      if (!state) {
        await thread.post(buildAvailableCommandHint());
        return;
      }

      const flow = flowRegistry.get(state.flowId);
      if (!flow) {
        await thread.post('An error occurred. Please try again.');
        return;
      }

      if (flowEngine.isFlowComplete(flow, state)) {
        await thread.post(buildAvailableCommandHint());
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
