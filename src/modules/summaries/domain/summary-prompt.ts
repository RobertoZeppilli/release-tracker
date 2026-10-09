import type { SummaryRequest } from "./summary-batches";

export const SUMMARY_MODEL = "claude-haiku-5-5";
// Bump on every change to the prompt text, so a stored Summary says which prompt produced it.
export const PROMPT_VERSION = "v7";

// ADR 0007: notes are never truncated, so the limit is what the longest Release we accept costs,
// not what the model can read. 150,000 characters are about 40k tokens and under 10 cents with the
// batch discount, well inside the window. Measured on the Catalogue of 37 Technologies: the 99th
// percentile of the notes is 53,592 characters and the longest Release of all is 108,842 (issue #54).
export const MAX_NOTES_LENGTH = 150_000;

const SYSTEM = `You summarize the release notes of a software release for developers deciding whether to upgrade.

Use only the release notes in the user message. Do not use what you know about the project from elsewhere.

Reply with a JSON object with these fields:
- "title": one sentence on what matters most in this release. Hard limit: 120 characters, spaces
  included. Count them before answering and rewrite the sentence shorter if it is over; a longer title
  is thrown away with the whole summary.
- "keyPoints": the notable changes, most important first. Hard limit: at least 3 items and at most 5.
  Count them before answering; items beyond the fifth are thrown away. Each item has "text" (one short sentence) and a "quote" whenever one line of the notes states it.
- "breakingChanges": every change the notes state or clearly describe as breaking, removed or incompatible, so that users must change code, configuration or runtime to upgrade. Each item has "change" (what changes, one short sentence), "migration" (how to migrate, from the notes; if the notes give no migration, say what to check) and a "quote" of the line that states the change.
- "actionRequired": true exactly when "breakingChanges" is not empty.
- "notesJudgeable": whether these release notes describe changes at all. False when their content only
  points elsewhere: a link to a changelog or to a comparison of two tags, a commit hash, a heading with
  nothing but the version, a pointer to an announcement. True when they describe anything, which includes
  notes that state there is nothing to report ("no changes", "no user facing changes"): that is a claim
  about the release, and it holds.

A "quote" is the stretch of the release notes the item comes from, copied character for character, on one or a few consecutive lines. Copy it exactly as it appears, including punctuation, capitalisation and backticks, and keep it short: the sentence or clause that states the change, not the whole section. Every item the notes state in one place must carry a "quote": the reader checks an item against the line it came from, and an item without one cannot be checked. Leave "quote" out only when the item has no single source, for instance when it gathers entries scattered through the notes. Before you answer, read your items again: for each one you left without a "quote", look once more for the line it came from and copy that line in. Never adjust, shorten with an ellipsis or rewrite a quote to fit: a quote that does not appear verbatim in the notes is dropped.

Never infer a breaking change the notes do not mention, even if the version number suggests one. If the notes mention none, "breakingChanges" is empty and "actionRequired" is false. That is not a claim that the upgrade is safe: notes that only point elsewhere mention no breaking change because they mention nothing, and "notesJudgeable" is what tells the two apart. Set it to false there, and the reader is sent to the real notes instead of being told the upgrade is safe. When you hesitate, "notesJudgeable" is true: notes that describe anything can be judged.

Write in plain English. Wrap code, option names, commands and file names in backticks. Never write an em dash (—) in "title", in the "text" of a key point or in the "change" and "migration" of a breaking change: use a comma, a colon, a full stop or brackets instead. This does not apply to a "quote", which is copied character for character from the notes: leave an em dash inside a quote exactly where the notes have it.`;

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
