import type { BotThread } from '@/lib/bot/types';
import { DEFAULT_LOCALE } from '../i18n';
import type { ResidentLocale } from '../i18n/types';
import type { FlowThreadState } from './flow-types';

export async function getThreadLocaleFromState(
  thread: BotThread
): Promise<ResidentLocale | undefined> {
  const state = (await thread.state) as FlowThreadState | null;
  return state?.locale;
}

/**
 * Resolve active locale from thread state during a running flow.
 * Falls back to configured default locale if state is missing.
 */
export async function getThreadLocale(
  thread: BotThread
): Promise<ResidentLocale> {
  return (await getThreadLocaleFromState(thread)) ?? DEFAULT_LOCALE;
}
