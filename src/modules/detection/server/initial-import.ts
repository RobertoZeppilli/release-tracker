import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoredTechnology } from "@/modules/catalog";
import { listActiveTechnologies } from "@/modules/catalog/server";
import { classify, selectInitialImport } from "@/modules/releases";
import type { SourceAdapters } from "../domain/source-adapters";
import { observeVersions } from "./observe-versions";
import { persistReleases } from "./persist-releases";

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
// The Sources are asked unconditionally: this runs once, and a validator stored by another phase
// would answer "unchanged" and leave the Technology without the past Releases it came for.
export async function importTechnology(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  now: Date,
): Promise<string[]> {
  const { versions: observed } = await observeVersions(db, technology, adapters, false);
  const observedVersions = observed.map(({ version }) => version);
  const candidates = observed.flatMap(({ version, publishedAt }) => {
    const significance = classify(version, technology.classificationStrategy, observedVersions);
    return significance === "excluded" ? [] : [{ version, publishedAt, significance }];
  });
  const selected = selectInitialImport(candidates, now);
  return persistReleases(
    db,
    technology,
    adapters,
    "imported",
    selected.map(({ history, ...release }) => ({ ...release, skip: history })),
  );
}
