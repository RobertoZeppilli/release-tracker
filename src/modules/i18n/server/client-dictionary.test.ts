import { describe, expect, it } from "vitest";
import { LOCALES } from "../domain/locales";
import { dictionaryFor } from "../domain/messages";
import { clientDictionary } from "./client-dictionary";
import { CLIENT_KEYS } from "./client-keys";

// The file is imported directly and not through the index, which is `server-only`.
describe("clientDictionary", () => {
  it("hands the browser the generated selection and nothing else", () => {
    expect(Object.keys(clientDictionary("en")).sort()).toEqual([...CLIENT_KEYS].sort());
  });

  it.each(LOCALES)("has no hole in %s", (locale) => {
    const dictionary = clientDictionary(locale);
    const missing = CLIENT_KEYS.filter((key) => dictionary[key] === undefined);
    expect(missing).toEqual([]);
  });

  it.each(LOCALES)("reads %s and not English", (locale) => {
    const full = dictionaryFor(locale);
    const dictionary = clientDictionary(locale);
    for (const key of CLIENT_KEYS) expect(dictionary[key]).toEqual(full[key]);
  });

  // The point of the selection, stated as a number: a regression that quietly handed the whole
  // dictionary back would still pass every test above.
  it("leaves most of the dictionary on the server", () => {
    const full = Object.keys(dictionaryFor("en")).length;
    expect(CLIENT_KEYS.length).toBeLessThan(full / 2);
  });

  // The words of the five document pages are read by server components alone, and they are the
  // heaviest families there are: `privacy` and `faq` were ~8.700 bytes of every page in the app.
  it.each(["privacy", "terms", "faq", "attributions", "contact"])("does not ship %s", (family) => {
    expect(CLIENT_KEYS.filter((key) => key.startsWith(`${family}.`))).toEqual([]);
  });
});
