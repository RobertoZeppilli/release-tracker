import { describe, expect, it } from "vitest";
import { MAX_NOTES_LENGTH, PROMPT_VERSION, prepareSummaryRequest, SUMMARY_MODEL } from "./summary-prompt";

const release = { releaseId: "7b0c5f6e-5d0e-4c55-9b43-1b0f3f3b8d11", technologyName: "Vite", version: "6.0.0" };

describe("prepareSummaryRequest", () => {
  it("builds the request from the release notes only", () => {
    const result = prepareSummaryRequest({ ...release, notes: "## Breaking\n\n- Drop Node 21" });
    if (!result.ok) throw new Error(result.reason);
    expect(result.request).toMatchObject({ releaseId: release.releaseId, model: SUMMARY_MODEL });
    expect(result.request.prompt).toContain("Vite 6.0.0");
    expect(result.request.prompt).toContain("<release_notes>\n## Breaking\n\n- Drop Node 21\n</release_notes>");
  });

  it("forbids inferring breaking changes the notes do not mention", () => {
    const result = prepareSummaryRequest({ ...release, notes: "Fixes" });
    if (!result.ok) throw new Error(result.reason);
    expect(result.request.system).toMatch(/never infer a breaking change/i);
    expect(result.request.system).toMatch(/only the release notes/i);
  });

  // Issue #87: the em dash is forbidden in every published text of the project, and a v4 Summary
  // put one in the title of `vite 8.0.0`. The ban lives in the prompt, so it has to be asserted there.
  it("forbids the em dash in the fields the model writes, and spares the quotes", () => {
    const result = prepareSummaryRequest({ ...release, notes: "Fixes" });
    if (!result.ok) throw new Error(result.reason);
    const emDash = "\u2014";
    expect(result.request.system).toContain(`Never write an em dash (${emDash})`);
    for (const field of ['"title"', '"text"', '"change"', '"migration"']) {
      expect(result.request.system).toContain(field);
    }
    expect(result.request.system).toMatch(/does not apply to a "quote"/);
  });

  // Issue #93: the rule above equated "the notes declare no breaking change" with "the upgrade is
  // safe", and the third exit is what separates them. It has to be asked of the model in the prompt,
  // because the heuristic that stands in for it only reads the first 400 characters of the notes.
  it("asks whether the notes could be judged at all, and says why it is a separate question", () => {
    const result = prepareSummaryRequest({ ...release, notes: "Fixes" });
    if (!result.ok) throw new Error(result.reason);
    expect(result.request.system).toContain('"notesJudgeable"');
    expect(result.request.system).toMatch(/not a claim that the upgrade is safe/i);
    expect(result.request.system).toMatch(/no changes/i);
  });

  it("names the prompt version it was built with", () => {
    expect(PROMPT_VERSION).toMatch(/^v\d+$/);
  });

  // Issue #54: the longest Release of the Catalogue, `next 16.3.0`. It was refused at the old limit
  // of 80,000, and it is one of the featured Releases the product exists for.
  it("accepts the longest release notes of the Catalogue, 108,842 characters", () => {
    expect(prepareSummaryRequest({ ...release, notes: "x".repeat(108_842) }).ok).toBe(true);
  });

  it("accepts notes at the threshold", () => {
    expect(prepareSummaryRequest({ ...release, notes: "x".repeat(MAX_NOTES_LENGTH) }).ok).toBe(true);
  });

  it("refuses notes over the threshold instead of truncating them", () => {
    const result = prepareSummaryRequest({ ...release, notes: "x".repeat(MAX_NOTES_LENGTH + 1) });
    expect(result).toEqual({
      ok: false,
      reason: `release notes are ${MAX_NOTES_LENGTH + 1} characters, over the ${MAX_NOTES_LENGTH} limit`,
    });
  });

  it("refuses empty notes", () => {
    expect(prepareSummaryRequest({ ...release, notes: " \n " })).toEqual({ ok: false, reason: "release notes are empty" });
  });
});
