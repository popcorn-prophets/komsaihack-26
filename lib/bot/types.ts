import { Thread } from 'chat';
import { FlowThreadState } from './flows/flow-types';

export type BotThread = Thread<FlowThreadState | unknown, unknown>;
