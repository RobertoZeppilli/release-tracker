import { type Locale } from "./locales";
import { type Dictionary, interpolate, type Message, type MessageParams } from "./message";
import type { MessageKey } from "./messages";

// `Intl.PluralRules` is built into the platform, which is the whole reason the module writes its own
// plurals instead of taking a library for them (ADR 0008): the rules of five languages are already
// in the runtime, and what is left to write is the choice of a form and the interpolation.
const rules = new Map<Locale, Intl.PluralRules>();

function pluralRules(locale: Locale): Intl.PluralRules {
  const existing = rules.get(locale);
  if (existing) return existing;
  const made = new Intl.PluralRules(locale);
  rules.set(locale, made);
  return made;
}

function formOf(message: Message, locale: Locale, params: MessageParams): string {
  if (typeof message === "string") return message;
  const count = params.count;
  // A message with forms and no count has no way to choose one, so it reads as the form a language
  // uses for everything it has no special form for. The alternative was throwing, which would take
  // a whole page down over one sentence.
  if (typeof count !== "number") return message.other;
  const form = pluralRules(locale).select(count);
  return message[form] ?? message.other;
}

// `t` as every component sees it. The key is typed, so a key that does not exist is a build error
// rather than a word printed to the reader. The parameter is there for the tests, which build a
// translator over a dictionary of their own: in the product it is always `MessageKey`.
export type Translator<Key extends string = MessageKey> = (key: Key, params?: MessageParams) => string;

// The translator of one page. It takes the dictionary rather than fetching it, so it is pure and
// so the browser is handed exactly the one language it is reading: a `createTranslator` that looked
// the dictionary up would pull all five into the client bundle through the import.
export function createTranslator<Given extends Dictionary>(
  locale: Locale,
  dictionary: Given,
): Translator<Extract<keyof Given, string>> {
  return function translate(key, params = {}) {
    const message = dictionary[key];
    // The key itself, when the dictionary has not got it. It is unreadable on purpose: a missing
    // key is a bug the tests catch, and a blank or an ellipsis would hide it until a reader found one.
    if (message === undefined) return key;
    return interpolate(formOf(message, locale, params), params);
  };
}
