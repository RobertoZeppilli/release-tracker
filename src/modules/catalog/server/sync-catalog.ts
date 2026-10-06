import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { CatalogEntry, Source } from "../domain/catalog-entry";
import { type CatalogSyncOperation, planCatalogSync } from "../domain/plan-catalog-sync";
import { readStoredTechnologies } from "./stored-technologies";

const IdRowSchema = z.object({ id: z.uuid() });

// Needs a service role client: the Catalog tables are read-only for everyone else.
// Not a transaction: every operation is idempotent, so a rerun completes a sync that stopped halfway.
export async function syncCatalog(
  db: SupabaseClient,
  entries: readonly CatalogEntry[],
): Promise<CatalogSyncOperation[]> {
  const operations = planCatalogSync(entries, await readStoredTechnologies(db));
  for (const operation of operations) await apply(db, operation);
  return operations;
}

async function apply(db: SupabaseClient, operation: CatalogSyncOperation): Promise<void> {
  switch (operation.type) {
    case "insert": {
      const { data, error } = await db
        .from("technologies")
        .insert({ slug: operation.entry.slug, ...technologyFields(operation.entry) })
        .select("id")
        .single();
      if (error) throw error;
      await upsertSources(db, IdRowSchema.parse(data).id, operation.entry.sources);
      return;
    }
    case "update": {
      const { error } = await db
        .from("technologies")
        .update({ ...technologyFields(operation.entry), retired: false, updated_at: new Date().toISOString() })
        .eq("id", operation.technologyId);
      if (error) throw error;
      await upsertSources(db, operation.technologyId, operation.entry.sources);
      if (operation.removedSourceIds.length > 0) {
        const removed = await db.from("sources").delete().in("id", operation.removedSourceIds);
        if (removed.error) throw removed.error;
      }
      return;
    }
    case "retire": {
      const { error } = await db
        .from("technologies")
        .update({ retired: true, updated_at: new Date().toISOString() })
        .eq("id", operation.technologyId);
      if (error) throw error;
      return;
    }
  }
}

function technologyFields(entry: CatalogEntry) {
  return {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    classification_strategy: entry.classificationStrategy,
  };
}

async function upsertSources(db: SupabaseClient, technologyId: string, sources: readonly Source[]) {
  const rows = sources.map(({ role, kind, ...config }) => ({ technology_id: technologyId, role, kind, config }));
  const { error } = await db.from("sources").upsert(rows, { onConflict: "technology_id,role,kind" });
  if (error) throw error;
}
