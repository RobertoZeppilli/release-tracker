import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { StoredTechnology } from "@/modules/catalog";
import { listActiveTechnologies } from "@/modules/catalog/server";
import { selectAllRows } from "@/lib/supabase-rows";
import { classify, type KnownReleases, type ReleaseRef, selectDetected } from "@/modules/releases";
import type { SourceAdapters } from "../domain/source-adapters";
import { observeVersions } from "./observe-versions";
import { persistReleases } from "./persist-releases";

const KnownRowSchema = z.array(
  z.object({ technology_id: z.uuid(), version: z.string(), published_at: z.iso.datetime({ offset: true }) }),
);

export type DetectionReport = {
  // Technologies whose Sources were asked: retired ones and those awaiting their Initial Import
  // are left out, and the second group is why nothing is asked for a Technology without Releases.
  asked: number;
  unchanged: number;
  detected: ReleaseRef[];
  failed: { slug: string; error: string }[];
};

// The daily Detection (ADR 0003): Sources in, new Releases out, no AI. One failing Technology does
// not stop the others; the next run retries it.
export async function detectReleases(
  db: SupabaseClient,
  adapters: SourceAdapters,
): Promise<DetectionReport> {
  const known = await readKnownReleases(db);
  const report: DetectionReport = { asked: 0, unchanged: 0, detected: [], failed: [] };

  for (const technology of await listActiveTechnologies(db)) {
    const releases = known.get(technology.id);
    if (releases === undefined) continue;
    report.asked++;
    try {
      const { versions, unchanged } = await detectTechnology(db, technology, adapters, releases);
      if (unchanged) report.unchanged++;
      for (const version of versions) report.detected.push({ slug: technology.slug, version });
    } catch (error) {
      report.failed.push({ slug: technology.slug, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return report;
}

async function detectTechnology(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  known: KnownReleases,
): Promise<{ versions: string[]; unchanged: boolean }> {
  const { versions: observed, unchanged } = await observeVersions(db, technology, adapters, true);
  if (unchanged) return { versions: [], unchanged };

  const observedVersions = observed.map(({ version }) => version);
  const candidates = observed.flatMap(({ version, publishedAt }) => {
    const significance = classify(version, technology.classificationStrategy, observedVersions);
    return significance === "excluded" ? [] : [{ version, publishedAt, significance }];
  });
  const selected = selectDetected(candidates, known);
  const versions = await persistReleases(
    db,
    technology,
    adapters,
    "detected",
    selected.map(({ summarize, ...release }) => ({ ...release, skip: !summarize })),
  );
  return { versions, unchanged };
}

// One reading of the whole Catalog, by page: a Technology absent from the result has no Releases at
// all and belongs to the Initial Import, not to the Detection. Truncating here would be silent and
// far worse than an error, because a Technology left out of the page stops being detected at all.
async function readKnownReleases(db: SupabaseClient): Promise<Map<string, KnownReleases>> {
  const data = await selectAllRows((from, to) =>
    db.from("releases").select("technology_id, version, published_at").order("id").range(from, to),
  );

  const known = new Map<string, { versions: string[]; latestPublishedAt: Date }>();
  for (const row of KnownRowSchema.parse(data)) {
    const publishedAt = new Date(row.published_at);
    const entry = known.get(row.technology_id);
    if (entry === undefined) {
      known.set(row.technology_id, { versions: [row.version], latestPublishedAt: publishedAt });
      continue;
    }
    entry.versions.push(row.version);
    if (publishedAt > entry.latestPublishedAt) entry.latestPublishedAt = publishedAt;
  }
  return known;
}
