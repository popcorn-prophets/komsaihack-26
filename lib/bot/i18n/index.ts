export {
  DEFAULT_LOCALE,
  getLocaleLabel,
  isSupportedLocale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from './config';
export { localizeIncidentSeverity } from './incident';
export { messageCatalog } from './locales';
export { resolveResidentLocale } from './resolver';
export { createTranslator, normalizeLocale, translate } from './translator';
export type { MessageCatalog, MessageKey, ResidentLocale } from './types';
