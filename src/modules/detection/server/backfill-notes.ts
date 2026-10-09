import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import type { StoredTechnology } from "@/modules/catalog";
import { listActiveTechnologies } from "@/modules/catalog/server";
import type { ReleaseRef } from "@/modules/releases";
import type { SourceAdapters } from "../domain/source-adapters";
import { findNotes, hasNotesSource } from "./find-notes";

const ReleaseRowSchema = z.array(z.object({ id: z.uuid(), technology_id: z.uuid(), version: z.string() }));
const NotesRowSchema = z.array(z.object({ release_id: z.uuid() }));

// Why a Release is still without Notes after the Sources were asked.
export type MissingReason = "not at the source" | "no notes source";

export type NotesBackfillReport = {
  // False is a dry run: the Sources are asked and nothing is written, so the numbers can be read
  // before anything changes.
  applied: boolean;
  asked: number;
  missing: number;
  filled: ReleaseRef[];
  remaining: (ReleaseRef & { reason: MissingReason })[];
  // Summaries moved from `unavailable` to `skipped`, because their notes now exist.
  settled: number;
  failed: { slug: string; error: string }[];
};

export type NotesBackfillOptions = { slug?: string; apply: boolean };

// Issue #80: Release Notes are written when a Release is born and never again (`persistReleases`
// uses `ignoreDuplicates`), so a Release that entered before its Source knew how to find them stays
// empty forever. This asks the `notes` Sources only for the Releases that have none, and leaves
// everything else alone: no Release, no Significance, no Summary that is not `unavailable`.
export async function backfillNotes(
  db: SupabaseClient,
  adapters: SourceAdapters,
  { slug, apply }: NotesBackfillOptions,
): Promise<NotesBackfillReport> {
  const withoutNotes = await readReleasesWithoutNotes(db);
  const report: NotesBackfillReport = { applied: apply, asked: 0, missing: 0, filled: [], remaining: [], settled: 0, failed: [] };

  for (const technology of await listActiveTechnologies(db)) {
    if (slug !== undefined && technology.slug !== slug) continue;
    const releases = withoutNotes.get(technology.id) ?? [];
    if (releases.length === 0) continue;
    report.missing += releases.length;

    if (!hasNotesSource(technology)) {
      for (const { version } of releases) {
        report.remaining.push({ slug: technology.slug, version, reason: "no notes source" });
      }
      continue;
    }

    report.asked++;
    try {
      report.settled += await backfillTechnology(db, technology, adapters, releases, apply, report);
    } catch (error) {
      report.failed.push({ slug: technology.slug, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return report;
}

type ReleaseWithoutNotes = { id: string; version: string };

async function backfillTechnology(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  releases: readonly ReleaseWithoutNotes[],
  apply: boolean,
  report: NotesBackfillReport,
): Promise<number> {
  const found = await findNotes(technology, adapters, releases.map(({ version }) => version));

  for (const { version } of releases) {
    if (found.has(version)) report.filled.push({ slug: technology.slug, version });
    // The Source was asked and has nothing: TypeScript never published the `v7.0-rc` tag, and no
    // number of runs will make it appear.
    else report.remaining.push({ slug: technology.slug, version, reason: "not at the source" });
  }
  if (!apply) return 0;

  const filled = releases.flatMap((release) => {
    const notes = found.get(release.version);
    return notes === undefined ? [] : [{ release: release, notes }];
  });
  if (filled.length === 0) return 0;

  const written = await db.from("release_notes").upsert(
    filled.map(({ release, notes }) => ({
      release_id: release.id,
      source_id: notes.sourceId,
      body: notes.body,
      url: notes.url,
    })),
    { onConflict: "release_id", ignoreDuplicates: true },
  );
  if (written.error) throw written.error;

  // CONTEXT.md, Stato della sintesi: notes arriving late settle the Summary as `skipped`, never as
  // `pending`. The guard is the whole safety of this step: a `ready` or `failed` Summary is never
  // touched, and nothing is ever queued, so this run cannot spend.
  const settled = await db
    .from("summaries")
    .update({ status: "skipped", updated_at: new Date().toISOString() })
    .in("release_id", filled.map(({ release }) => release.id))
    .eq("status", "unavailable")
    .select("release_id");
  if (settled.error) throw settled.error;
  return NotesRowSchema.parse(settled.data).length;
}

// Two readings and a difference, by page: the Releases, then the ones that already have Notes.
// Paging matters here more than anywhere, because a truncated first list would read as "these
// Releases have no notes" and send the Sources after Releases that are already complete.
async function readReleasesWithoutNotes(db: SupabaseClient): Promise<Map<string, ReleaseWithoutNotes[]>> {
  const releases = ReleaseRowSchema.parse(
    await selectAllRows((from, to) => db.from("releases").select("id, technology_id, version").order("id").range(from, to)),
  );
  const noted = new Set(
    NotesRowSchema.parse(
      await selectAllRows((from, to) => db.from("release_notes").select("release_id").order("release_id").range(from, to)),
    ).map(({ release_id }) => release_id),
  );

  const byTechnology = new Map<string, ReleaseWithoutNotes[]>();
  for (const row of releases) {
    if (noted.has(row.id)) continue;
    const entry = byTechnology.get(row.technology_id);
    if (entry === undefined) byTechnology.set(row.technology_id, [{ id: row.id, version: row.version }]);
    else entry.push({ id: row.id, version: row.version });
  }
  // The paging orders by `id`, which is a random UUID: without this the report would list the same
  // Releases in a different order every run, and a reader could not compare two runs.
  for (const releases of byTechnology.values()) releases.sort((a, b) => a.version.localeCompare(b.version));
  return byTechnology;
}
