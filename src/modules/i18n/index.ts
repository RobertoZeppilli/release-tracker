export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_NAMES,
  LOCALES,
  localeAlternates,
  localePath,
  localeSchema,
  stripLocale,
  type Locale,
} from "./domain/locales";
export { dictionaryFor, type MessageKey } from "./domain/messages";
export { type Dictionary, messageParts, type MessageParams } from "./domain/message";
export { createTranslator, type Translator } from "./domain/translate";
