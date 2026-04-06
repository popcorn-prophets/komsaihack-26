import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LOCALE } from './config';
import { normalizeLocale } from './translator';
import type { ResidentLocale } from './types';

/**
 * Resolve the resident's preferred locale from their saved language preference.
 * Queries the residents table by thread_id and returns their language setting.
 * Falls back to the configured default locale if resident data is unavailable.
 *
 * @param threadId The bot thread ID (usually resident.thread_id)
 * @returns Normalized ResidentLocale
 */
export async function resolveResidentLocale(
  threadId: string
): Promise<ResidentLocale> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('residents')
      .select('language')
      .eq('thread_id', threadId)
      .maybeSingle();

    if (error) {
      console.error('Error resolving resident locale:', {
        threadId,
        error,
      });
      return DEFAULT_LOCALE;
    }

    if (!data?.language) {
      return DEFAULT_LOCALE;
    }

    // Normalize language value and apply fallback when needed.
    return normalizeLocale(data.language);
  } catch (error) {
    console.error('Unexpected error resolving resident locale:', {
      threadId,
      error,
    });
    return DEFAULT_LOCALE;
  }
}
