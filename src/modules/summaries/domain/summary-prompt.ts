import type { SummaryRequest } from "./summary-batches";

export const SUMMARY_MODEL = "claude-opus-5";
// Bump on every change to the prompt text, so a stored Summary says which prompt produced it.
export const PROMPT_VERSION = "v1";

// ADR 0007: notes are never truncated. About 20k tokens, a few cents per Summary with the batch discount.
export const MAX_NOTES_LENGTH = 80_000;

const SYSTEM = `You summarize the release notes of a software release for developers deciding whether to upgrade.

Use only the release notes in the user message. Do not use what you know about the project from elsewhere.

Reply with a JSON object with these fields:
- "title": one sentence, at most 120 characters, on what matters most in this release.
- "keyPoints": 3 to 5 short sentences on the notable changes, most important first.
- "breakingChanges": every change the notes state or clearly describe as breaking, removed or incompatible, so that users must change code, configuration or runtime to upgrade. Each item has "change" (what changes, one short sentence) and "migration" (how to migrate, from the notes; if the notes give no migration, say what to check).
- "actionRequired": true exactly when "breakingChanges" is not empty.

Never infer a breaking change the notes do not mention, even if the version number suggests one. If the notes mention none, "breakingChanges" is empty and "actionRequired" is false.

Write in plain English. Wrap code, option names, commands and file names in backticks.`;

export type SummaryInput = { releaseId: string; technologyName: string; version: string; notes: string };

export type PreparedRequest = { ok: true; request: SummaryRequest } | { ok: false; reason: string };

export function prepareSummaryRequest({ releaseId, technologyName, version, notes }: SummaryInput): PreparedRequest {
  if (notes.trim() === "") return { ok: false, reason: "release notes are empty" };
  if (notes.length > MAX_NOTES_LENGTH) {
    return { ok: false, reason: `release notes are ${notes.length} characters, over the ${MAX_NOTES_LENGTH} limit` };
  }
  const prompt = `Release notes of ${technologyName} ${version}:\n\n<release_notes>\n${notes}\n</release_notes>`;
  return { ok: true, request: { releaseId, model: SUMMARY_MODEL, system: SYSTEM, prompt } };
}
