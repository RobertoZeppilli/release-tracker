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

  it("names the prompt version it was built with", () => {
    expect(PROMPT_VERSION).toMatch(/^v\d+$/);
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
