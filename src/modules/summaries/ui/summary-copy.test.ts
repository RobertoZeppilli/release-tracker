import { describe, expect, it } from "vitest";
import { provenanceLine } from "./summary-copy";

describe("provenanceLine", () => {
  it("names the model and the prompt version that wrote the Summary", () => {
    expect(provenanceLine({ model: "claude-opus-5", promptVersion: "v4" })).toBe(
      "summary · from the release notes only · claude-opus-5 · prompt v4",
    );
  });
});
