import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { StoredTechnology } from "@/modules/catalog";
import { initialSummaryStatus, type Significance } from "@/modules/releases";
import type { SourceAdapters } from "../domain/source-adapters";
import { findNotes } from "./find-notes";

const ReleaseIdSchema = z.array(z.object({ id: z.uuid(), version: z.string() }));

export type ReleaseOrigin = "imported" | "detected";

// `skip` says the phase chose not to summarize this Release; the notes decide the rest.
export type ReleaseToStore = { version: string; significance: Significance; publishedAt: Date; skip: boolean };

// Writes the Releases, their Release Notes and the initial state of their Summaries.
//
// Idempotent on Technology + Version: `ignoreDuplicates` leaves an existing Release, its notes and
// its Summary alone, so a Correzione di rilevanza set by hand survives every later run — the
// Detection never updates `significance`, let alone `significance_override`.
export async function persistReleases(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  origin: ReleaseOrigin,
  releases: readonly ReleaseToStore[],
): Promise<string[]> {
  if (releases.length === 0) return [];
  const versions = releases.map((release) => release.version);
  const notes = await findNotes(technology, adapters, versions);

  const inserted = await db.from("releases").upsert(
    releases.map((release) => ({
      technology_id: technology.id,
      version: release.version,
      significance: release.significance,
      origin,
      published_at: release.publishedAt.toISOString(),
    })),
    { onConflict: "technology_id,version", ignoreDuplicates: true },
  );
  if (inserted.error) throw inserted.error;

  // Unpaged: restricted to the Versions this one run is writing for one Technology, and the initial
  // import keeps a twelve month window, so the list never approaches a thousand (issue #190).
  const stored = await db.from("releases").select("id, version").eq("technology_id", technology.id).in("version", versions);
  if (stored.error) throw stored.error;
  const idByVersion = new Map(ReleaseIdSchema.parse(stored.data).map((row) => [row.version, row.id]));

  const rows = releases.flatMap((release) => {
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
    status: initialSummaryStatus({ significance: release.significance, hasNotes: found !== undefined, skip: release.skip }),
  }));
  const { error } = await db.from("summaries").upsert(summaryRows, { onConflict: "release_id", ignoreDuplicates: true });
  if (error) throw error;
  return rows.map(({ release }) => release.version);
}
