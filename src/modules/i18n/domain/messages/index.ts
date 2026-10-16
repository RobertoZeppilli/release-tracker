import { DEFAULT_LOCALE, type Locale } from "../locales";
import type { Dictionary, Message } from "../message";
import { EN } from "./en";

export { EN, type MessageKey } from "./en";

// Every key English has, which is what `t` is typed by: a dictionary of `string` keys would hand the
// product a `t` that takes any string, and a key with a typo would print itself to the reader.
export type MessageDictionary = Readonly<Record<keyof typeof EN, Message>>;

// The translations, by language. English is not here: it is the base every one of them is merged
// over, so it cannot be one of them.
// ⚠️ There are none yet: this PR takes the strings out of the components and puts the picker and the
// plumbing in place, and the four translations are the next PR (#131). Until then every language
// reads English, which is the honest state of it: the address, the `lang` and the `hreflang` change
// and the words do not.
const TRANSLATIONS: Readonly<
  Partial<Record<Exclude<Locale, typeof DEFAULT_LOCALE>, Dictionary>>
> = {};

const merged = new Map<Locale, MessageDictionary>();

// The dictionary a page is read with: the translation over English, so a key the translation has not
// got reads in English instead of leaving a hole in the page. The merge happens here, once per
// language, and not in the translator: a dictionary that already carries its fallback is one object
// to hand to the browser instead of two, and `t` stays a lookup.
// ⚠️ The parity test is what keeps the fallback from being how the product ships.
export function dictionaryFor(locale: Locale): MessageDictionary {
  const existing = merged.get(locale);
  if (existing) return existing;
  const translation = locale === DEFAULT_LOCALE ? undefined : TRANSLATIONS[locale];
  const dictionary: MessageDictionary = translation ? { ...EN, ...translation } : EN;
  merged.set(locale, dictionary);
  return dictionary;
}

export function translationFor(locale: Locale): Dictionary | undefined {
  return locale === DEFAULT_LOCALE ? EN : TRANSLATIONS[locale];
}
