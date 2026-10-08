import { describe, expect, it } from "vitest";
import { SIGNIFICANCE_ORDER, VOCABULARY } from "./vocabulary";

// The landing is where the four Significance words are defined (issue #26), so a level the schema
// gains and the legend does not would leave a word the app shows and nothing explains, which is the
// gap this page exists to close.

describe("the vocabulary legend", () => {
  it("defines every Significance the schema has, in the schema's order", () => {
    expect(VOCABULARY.map(({ significance }) => significance)).toEqual([...SIGNIFICANCE_ORDER]);
  });

  it("defines each one in a sentence, not in a word", () => {
    for (const { significance, definition } of VOCABULARY) {
      expect(definition.length, significance).toBeGreaterThan(60);
      expect(definition.trimEnd(), significance).toMatch(/\.$/);
    }
  });
});
