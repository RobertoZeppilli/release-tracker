import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { StoredTechnology } from "@/modules/catalog";
import { listActiveTechnologies } from "@/modules/catalog/server";
import { classify, initialSummaryStatus, selectInitialImport } from "@/modules/releases";
import type { FoundNotes, SourceAdapters } from "../domain/source-adapters";

const ReleaseIdSchema = z.array(z.object({ id: z.uuid(), version: z.string() }));

// A Technology is imported until it has a Release, so an import that stopped halfway is picked up
// again by the next deploy instead of being lost with the sync's `insert`.
export async function technologiesAwaitingImport(db: SupabaseClient): Promise<StoredTechnology[]> {
  const awaiting: StoredTechnology[] = [];
  for (const technology of await listActiveTechnologies(db)) {
    const { count, error } = await db
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("technology_id", technology.id);
    if (error) throw error;
    if (count === 0) awaiting.push(technology);
  }
  return awaiting;
}

// Idempotent on Technology + Version: existing Releases, notes and Summary states are left alone.
export async function importTechnology(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  now: Date,
): Promise<number> {
  const candidates = (await observeVersions(technology, adapters)).flatMap(({ version, publishedAt }) => {
    const significance = classify(version, technology.classificationStrategy);
    return significance === "excluded" ? [] : [{ version, publishedAt, significance }];
  });
  const selected = selectInitialImport(candidates, now);
  if (selected.length === 0) return 0;

  const versions = selected.map((release) => release.version);
  const notes = await findNotes(technology, adapters, versions);

  const inserted = await db.from("releases").upsert(
    selected.map((release) => ({
      technology_id: technology.id,
      version: release.version,
      significance: release.significance,
      origin: "imported",
      published_at: release.publishedAt.toISOString(),
    })),
    { onConflict: "technology_id,version", ignoreDuplicates: true },
  );
  if (inserted.error) throw inserted.error;

  const stored = await db.from("releases").select("id, version").eq("technology_id", technology.id).in("version", versions);
  if (stored.error) throw stored.error;
  const idByVersion = new Map(ReleaseIdSchema.parse(stored.data).map((row) => [row.version, row.id]));

  const rows = selected.flatMap((release) => {
    const releaseId = idByVersion.get(release.version);
    return releaseId === undefined ? [] : [{ releaseId, release, notes: notes.get(release.version) }];
  });

  const notesRows = rows.flatMap(({ releaseId, notes: found }) =>
    found ? [{ release_id: releaseId, source_id: found.sourceId, body: found.body, url: found.url }] : [],
  );
  if (notesRows.length > 0) {
    const { error } = await db.from("release_notes").upsert(notesRows, { onConflict: "release_id", ignoreDuplicates: true });
    if (error) throw error;
  }

  const summaryRows = rows.map(({ releaseId, release, notes: found }) => ({
    release_id: releaseId,
    status: initialSummaryStatus({ significance: release.significance, hasNotes: found !== undefined, history: release.history }),
  }));
  const { error } = await db.from("summaries").upsert(summaryRows, { onConflict: "release_id", ignoreDuplicates: true });
  if (error) throw error;
  return selected.length;
}

// One Release per Version, however many detection Sources report it: the earliest date wins.
async function observeVersions(technology: StoredTechnology, adapters: SourceAdapters) {
  const earliest = new Map<string, Date>();
  for (const source of technology.sources) {
    if (source.role !== "detection") continue;
    for (const { version, publishedAt } of await adapters.listVersions(source)) {
      const known = earliest.get(version);
      if (!known || publishedAt < known) earliest.set(version, publishedAt);
    }
  }
  return [...earliest].map(([version, publishedAt]) => ({ version, publishedAt }));
}

async function findNotes(technology: StoredTechnology, adapters: SourceAdapters, versions: readonly string[]) {
  const found = new Map<string, FoundNotes & { sourceId: string }>();
  for (const source of technology.sources) {
    if (source.role !== "notes") continue;
    const missing = versions.filter((version) => !found.has(version));
    for (const [version, notes] of await adapters.findNotes(source, missing)) {
      found.set(version, { ...notes, sourceId: source.id });
    }
  }
  return found;
}

