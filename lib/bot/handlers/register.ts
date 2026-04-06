import type { BotInstance } from '@/lib/bot/chat';
import { flowEngine } from '@/lib/bot/flows/flow-engine';
import { getThreadLocaleFromState } from '@/lib/bot/flows/flow-locale';
import { flowRegistry } from '@/lib/bot/flows/flow-registry';
import type { Flow, FlowThreadState } from '@/lib/bot/flows/flow-types';
import {
  DEFAULT_LOCALE,
  resolveResidentLocale,
  translate,
} from '@/lib/bot/i18n';
import type { ResidentLocale } from '@/lib/bot/i18n/types';
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

  function buildAvailableCommandHint(
    locale: ResidentLocale = DEFAULT_LOCALE
  ): string {
    const commands = flowRegistry.getStartCommands();

    if (commands.length === 0) {
      return translate('handler.flow_complete.hint', locale);
    }

    return translate('handler.start.hint', locale, {
      commands: commands.join('", "'),
    });
  }

  async function resolveThreadLocale(
    thread: BotThread
  ): Promise<ResidentLocale> {
    const cachedLocale = await getThreadLocaleFromState(thread);
    if (cachedLocale) {
      return cachedLocale;
    }

    return resolveResidentLocale(thread.id);
  }

  async function startFlow(
    thread: BotThread,
    flow: Flow,
    context: { hasResident: boolean },
    visitedFlowIds: Set<string> = new Set()
  ): Promise<boolean> {
    const locale = await resolveThreadLocale(thread);

    if (visitedFlowIds.has(flow.id)) {
      console.error(`Detected cyclic flow fallback while starting ${flow.id}`);
      await thread.post(translate('error.flow.cyclic', locale));
      return false;
    }

    visitedFlowIds.add(flow.id);

    if (flow.start?.requiresResident && !context.hasResident) {
      if (flow.start.missingResidentMessageKey) {
        await thread.post(
          translate(flow.start.missingResidentMessageKey, locale)
        );
      } else if (flow.start.missingResidentMessage) {
        await thread.post(flow.start.missingResidentMessage);
      }

      const fallbackFlowId = flow.start.fallbackFlowId;
      if (!fallbackFlowId) {
        return false;
      }

      const fallbackFlow = flowRegistry.get(fallbackFlowId);
      if (!fallbackFlow) {
        console.error(`Fallback flow not registered: ${fallbackFlowId}`);
        await thread.post(translate('error.flow.start_error', locale));
        return false;
      }

      return startFlow(thread, fallbackFlow, context, visitedFlowIds);
    }

    if (flow.onStart) {
      await flow.onStart(thread);
    }

    const initialState: FlowThreadState = flowEngine.createInitialState(
      flow.id,
      1,
      locale
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
      await thread.post(translate('error.flow.invalid_step'));
      return null;
    }

    const flow = flowRegistry.get(state.flowId);
    if (!flow) {
      console.error(`Flow not registered: ${state.flowId}`);
      await thread.post(translate('handler.error', state.locale));
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
      await thread.post(
        translate('handler.flow_already_complete', state.locale)
      );
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

    const result = await flowEngine.handleStepInput(
      flow,
      state,
      thread as BotThread,
      input
    );

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

      // Resolve locale for the resident
      const locale = await resolveThreadLocale(thread as BotThread);

      const welcomeMsg = hasResident
        ? translate('handler.start.welcome_back', locale)
        : translate('handler.start.welcome', locale);

      await thread.post(welcomeMsg);
      await thread.post(buildAvailableCommandHint(locale));
    } catch (error) {
      console.error('Error in onNewMention handler:', error);
      await thread.post(translate('error.unexpected'));
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
        const locale = await resolveThreadLocale(thread as BotThread);
        await thread.post(translate('handler.stop', locale));
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
        const locale = await resolveThreadLocale(thread as BotThread);
        await thread.post(buildAvailableCommandHint(locale));
        return;
      }

      const flow = flowRegistry.get(state.flowId);
      if (!flow) {
        await thread.post(translate('handler.error', state.locale));
        return;
      }

      if (flowEngine.isFlowComplete(flow, state)) {
        await thread.post(buildAvailableCommandHint(state.locale));
        return;
      }

      await processFlowInput(thread as BotThread, message);
    } catch (error) {
      console.error('Error processing message:', error);
      await thread.post(translate('handler.error'));
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
      const locale = await resolveThreadLocale(event.thread as BotThread);
      await event.thread.post(translate('handler.error', locale));
    }
  });
}
