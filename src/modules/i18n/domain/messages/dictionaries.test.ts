import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES } from "../locales";
import { type Dictionary, dictionarySchema, placeholdersOf } from "../message";
import { dictionaryFor, EN, translationFor } from ".";

// The English dictionary read by a key that is a plain string, which is what a loop over its own
// keys hands back: `EN` is typed by its keys, and `Object.keys` has forgotten them.
const english: Dictionary = EN;

// The languages that have a dictionary of their own. English is always one of them; the others join
// as they are written, and this file is what they have to satisfy to be in the product (ADR 0008).
const written = LOCALES.filter(
  (locale) => translationFor(locale) !== undefined,
);

describe("the English dictionary", () => {
  it("is a dictionary", () => {
    expect(dictionarySchema.safeParse(EN).success).toBe(true);
  });

  it("names every key inside a namespace", () => {
    // `shell.signIn`, never `signIn`: the namespace is the unit a page can be handed on its own, so
    // a key without one belongs to nothing.
    const loose = Object.keys(EN).filter((key) => !/^[a-z]+\.[A-Za-z.]+$/.test(key));
    expect(loose).toEqual([]);
  });

  it("has no two keys with the same text and the same namespace", () => {
    // Not a rule, a smell: two keys with one string are two places to translate one sentence, and
    // the second is the one that gets forgotten. It is allowed across namespaces, where the same
    // word is genuinely two words (`account` the page and `account` the panel).
    const seen = new Map<string, string>();
    const doubled: string[] = [];
    for (const [key, message] of Object.entries(EN)) {
      if (typeof message !== "string") continue;
      const namespace = key.slice(0, key.indexOf("."));
      const token = `${namespace}:${message}`;
      const first = seen.get(token);
      if (first) doubled.push(`${first} and ${key} both say "${message}"`);
      else seen.set(token, key);
    }
    expect(doubled).toEqual([]);
  });
});

describe.each(written)("the %s dictionary", (locale) => {
  const translation = translationFor(locale) ?? {};

  it("is a dictionary", () => {
    expect(dictionarySchema.safeParse(translation).success).toBe(true);
  });

  it("has every key English has, and no key English has not", () => {
    // This is the test that keeps the English fallback in `dictionaryFor` from being how the product
    // ships: a missing key reads in English on the page and says nothing about itself, so the only
    // place it can be caught is here.
    expect(Object.keys(translation).sort()).toEqual(Object.keys(EN).sort());
  });

  it("interpolates the same names English does", () => {
    const wrong = Object.keys(EN)
      .map((key) => ({
        key,
        en: placeholdersOf(english[key] ?? ""),
        mine: placeholdersOf(translation[key] ?? ""),
      }))
      .filter(({ en, mine }) => en.join() !== mine.join())
      .map(({ key, en, mine }) => `${key}: ${en.join()} vs ${mine.join()}`);
    expect(wrong).toEqual([]);
  });

  it("writes every plural form its language has, for every counted message", () => {
    // `Intl.PluralRules` says which forms a language chooses between; a form it can choose and the
    // dictionary has not got would fall back to `other`, which is the silent half-translation.
    const forms = new Set(new Intl.PluralRules(locale).resolvedOptions().pluralCategories);
    const missing: string[] = [];
    for (const [key, message] of Object.entries(translation)) {
      if (typeof message === "string") continue;
      for (const form of forms) if (!(form in message)) missing.push(`${key} has no \`${form}\``);
    }
    expect(missing).toEqual([]);
  });

  it("writes a counted message wherever English writes one", () => {
    const shapes = Object.keys(EN)
      .filter((key) => (typeof english[key] === "string") !== (typeof translation[key] === "string"))
      .map((key) => `${key} is counted in one language and not in the other`);
    expect(shapes).toEqual([]);
  });
});

describe("dictionaryFor", () => {
  it("gives English the English dictionary", () => {
    expect(dictionaryFor(DEFAULT_LOCALE)).toBe(EN);
  });

  it("gives a language with no dictionary yet the English one, so no page has a hole in it", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(dictionaryFor(locale)).sort()).toEqual(Object.keys(EN).sort());
    }
  });
});
