import { describe, expect, it } from "vitest";
import { dictionaryFor } from "@/modules/i18n";
import { SIGNIFICANCE_ORDER, VOCABULARY } from "./vocabulary";

// The landing is where the four Significance words are defined (issue #26), so a level the schema
// gains and the legend does not would leave a word the app shows and nothing explains, which is the
// gap this page exists to close.
// Since ADR 0008 the sentence itself lives in the dictionary, so the second test reads it from
// there: it is the one that would have caught a level paired with a key nobody wrote.

describe("the vocabulary legend", () => {
  it("defines every Significance the schema has, in the schema's order", () => {
    expect(VOCABULARY.map(({ significance }) => significance)).toEqual([...SIGNIFICANCE_ORDER]);
  });

  it("defines each one in a sentence, not in a word", () => {
    const english = dictionaryFor("en");
    for (const { significance, definition } of VOCABULARY) {
      const sentence = english[definition];
      expect(typeof sentence, significance).toBe("string");
      expect(String(sentence).length, significance).toBeGreaterThan(60);
      expect(String(sentence).trimEnd(), significance).toMatch(/\.$/);
    }
  });
});
