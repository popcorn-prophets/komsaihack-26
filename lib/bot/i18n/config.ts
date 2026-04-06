import {
  getResidentLanguageLabel,
  isResidentLanguage,
  RESIDENT_LANGUAGE_LABELS,
  RESIDENT_LANGUAGE_VALUES,
  type ResidentLanguage,
} from '@/lib/residents/languages';

/**
 * Supported locale codes for resident-facing bot messages.
 *
 * Update the shared resident language catalog when adding or removing locale support.
 */
export const SUPPORTED_LOCALES = RESIDENT_LANGUAGE_VALUES;

export type ResidentLocale = ResidentLanguage;

/**
 * Global default locale used as fallback in translation resolution.
 */
export const DEFAULT_LOCALE: ResidentLocale = 'eng';

/**
 * Human-readable locale labels for onboarding language selection.
 */
export const LOCALE_LABELS: Record<ResidentLocale, string> =
  RESIDENT_LANGUAGE_LABELS;

/**
 * Runtime guard for locale values.
 */
export function isSupportedLocale(value: unknown): value is ResidentLocale {
  return isResidentLanguage(value);
}

/**
 * Resolve display label for a locale code.
 */
export function getLocaleLabel(locale: ResidentLocale): string {
  return getResidentLanguageLabel(locale);
}
