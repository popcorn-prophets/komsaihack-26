import { Chat } from 'chat';
import { adapters, state } from './adapters';
import { FlowThreadState } from './flows/flow-types';

export type BotInstance = Chat<typeof adapters, FlowThreadState>;

/**
 * Create a new bot instance.
 */
export function createBot(): BotInstance {
  return new Chat<typeof adapters, FlowThreadState>({
    userName: 'project_hermes_bot',
    adapters,
    state: state,
  });
}
