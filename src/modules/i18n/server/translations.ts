import { createTranslator, type Translator } from "../domain/translate";
import { dictionaryFor } from "../domain/messages";
import { currentLocale } from "./current-locale";

// The translator of the page being rendered, for the half of the tree that runs on the server. It
// reads the language from the root parameter, so a Server Component asks for `t` and is never handed
// a locale to pass on (`currentLocale`).
export async function getTranslator(): Promise<Translator> {
  const locale = await currentLocale();
  return createTranslator(locale, dictionaryFor(locale));
}
