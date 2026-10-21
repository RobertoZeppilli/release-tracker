import { DEFAULT_LOCALE, type Locale } from "../locales";
import type { Dictionary, Message } from "../message";
import { DE } from "./de";
import { EN } from "./en";
import { ES } from "./es";
import { FR } from "./fr";
import { IT } from "./it";

export { EN, type MessageKey } from "./en";

// Every key English has, which is what `t` is typed by: a dictionary of `string` keys would hand the
// product a `t` that takes any string, and a key with a typo would print itself to the reader.
export type MessageDictionary = Readonly<Record<keyof typeof EN, Message>>;

// The translations, by language. English is not here: it is the base every one of them is merged
// over, so it cannot be one of them.
// All four are written now, so the fallback in `dictionaryFor` has nothing left to catch: it stays
// because it is what keeps a fifth language from shipping with holes in it, not because any of
// these four needs it. The parity test is what proves that, language by language.
// ⚠️ Italian and English are the user's own; French, Spanish and German entered unreviewed by a
// native speaker and are to be reviewed before the launch (ADR 0008).
// The type is still `Partial`: a language added to `LOCALES` without a dictionary has to be a
// compiling, honest state, or the only way to add one would be to write it all first.
const TRANSLATIONS: Readonly<
  Partial<Record<Exclude<Locale, typeof DEFAULT_LOCALE>, Dictionary>>
> = { it: IT, fr: FR, es: ES, de: DE };

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
