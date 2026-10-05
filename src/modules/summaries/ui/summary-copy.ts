import type { StoredSummary } from "../domain/summary-content";

// The provenance tail under the Summary title. It is never shortened: the database refuses a ready
// Summary without model and prompt version (issue #88), so a missing piece would be a bug to see,
// not a detail to hide.
export function provenanceLine({ model, promptVersion }: Pick<StoredSummary, "model" | "promptVersion">): string {
  return ["summary", "from the release notes only", model, `prompt ${promptVersion}`].join(" · ");
}
