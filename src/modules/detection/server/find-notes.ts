import type { StoredTechnology } from "@/modules/catalog";
import type { FoundNotes, SourceAdapters } from "../domain/source-adapters";

export type SourcedNotes = FoundNotes & { sourceId: string };

// Asks the Technology's `notes` Sources for the given Versions, in the order the Catalog lists them:
// the first Source that answers for a Version wins, and a Source is not asked at all once nothing is
// left to look for. A Version missing from the result is a Version the Sources do not have.
export async function findNotes(
  technology: StoredTechnology,
  adapters: SourceAdapters,
  versions: readonly string[],
): Promise<Map<string, SourcedNotes>> {
  const found = new Map<string, SourcedNotes>();
  for (const source of technology.sources) {
    if (source.role !== "notes") continue;
    const missing = versions.filter((version) => !found.has(version));
    if (missing.length === 0) break;
    for (const [version, notes] of await adapters.findNotes(source, missing)) {
      found.set(version, { ...notes, sourceId: source.id });
    }
  }
  return found;
}

// Whether the Catalog gives the Technology anywhere to look at all.
export function hasNotesSource(technology: StoredTechnology): boolean {
  return technology.sources.some((source) => source.role === "notes");
}
