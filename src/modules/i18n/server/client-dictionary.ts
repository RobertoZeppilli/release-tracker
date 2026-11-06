import type { Locale } from "../domain/locales";
import type { Dictionary } from "../domain/message";
import { dictionaryFor } from "../domain/messages";
import { CLIENT_KEYS } from "./client-keys";

// The messages handed to the browser, which are not all of them. `LocaleProvider` carries a
// dictionary because a Client Component cannot import one (it would pull all five languages into
// the bundle), and it used to carry the whole of it: the words of `privacy`, `terms` and `faq`
// travelled inside every page, inlined in the HTML and again in the RSC payload, to be read by
// nothing. What the browser can ask for is decided by the client chunks themselves
// (`scripts/i18n-client-keys.mts`), so this is a selection and never a judgement call.
//
// ⚠️ It lives in `server/`, not in `domain/`: the index here is `server-only`, so a Client
// Component that imported the list would fail the build instead of shipping it.
const selected = new Map<Locale, Dictionary>();

export function clientDictionary(locale: Locale): Dictionary {
  const existing = selected.get(locale);
  if (existing) return existing;
  const full = dictionaryFor(locale);
  // A key missing from `full` cannot happen -- `CLIENT_KEYS` is typed on the English keys and every
  // language is merged over English -- so this builds the record without a hole to defend against.
  const made: Dictionary = Object.fromEntries(CLIENT_KEYS.map((key) => [key, full[key]]));
  selected.set(locale, made);
  return made;
}
