import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { provenanceLine } from "./summary-copy";

const t = createTranslator("en", dictionaryFor("en"));

describe("provenanceLine", () => {
  it("names the model and the prompt version that wrote the Summary", () => {
    expect(provenanceLine({ model: "claude-opus-5", promptVersion: "v4" }, t)).toBe(
      "summary · from the release notes only · claude-opus-5 · prompt v4",
    );
  });
});
