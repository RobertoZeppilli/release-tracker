import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoredTechnology } from "@/modules/catalog";
import type { ObservedVersion, SourceAdapters } from "../domain/source-adapters";

// `unchanged` is true when every detection Source answered that nothing moved since the last run:
// there is then no list to look at, which is not the same as a Technology that published nothing.
export type Observation = { versions: ObservedVersion[]; unchanged: boolean };

// One Release per Version, however many detection Sources report it: the earliest date wins.
// With `conditional`, each Source is asked with the validator stored beside it and the answer's new
// validator is written back, so a quiet day costs a request with no body instead of a packument.
export async function observeVersions(
  db: SupabaseClient,
  technology: StoredTechnology,
  adapters: SourceAdapters,
  conditional: boolean,
): Promise<Observation> {
  const earliest = new Map<string, Date>();
  let asked = 0;
  let unchanged = 0;

  for (const source of technology.sources) {
    if (source.role !== "detection") continue;
    asked++;
    const listing = await adapters.listVersions(source, conditional ? source.etag : undefined);
    if (listing === "unchanged") {
      unchanged++;
      continue;
    }
    if (conditional && listing.etag !== source.etag) await storeEtag(db, source.id, listing.etag);
    for (const { version, publishedAt } of listing.versions) {
      const known = earliest.get(version);
      if (!known || publishedAt < known) earliest.set(version, publishedAt);
    }
  }

  return {
    versions: [...earliest].map(([version, publishedAt]) => ({ version, publishedAt })),
    unchanged: asked > 0 && unchanged === asked,
  };
}

// Written only after the listing has been read: a validator stored for a body we failed to parse
// would make the next run skip the Versions it never saw.
async function storeEtag(db: SupabaseClient, sourceId: string, etag: string | null): Promise<void> {
  const { error } = await db.from("sources").update({ etag }).eq("id", sourceId);
  if (error) throw error;
}
