import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoredTechnology } from "../domain/plan-catalog-sync";
import { SlugSchema } from "../domain/catalog-entry";
import { TECHNOLOGY_COLUMNS, toStoredTechnology } from "./stored-technologies";

// Retired Technologies are returned too: their public pages stay online (ADR 0005).
export async function getTechnology(db: SupabaseClient, slug: string): Promise<StoredTechnology | null> {
  if (!SlugSchema.safeParse(slug).success) return null;
  const { data, error } = await db.from("technologies").select(TECHNOLOGY_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data === null ? null : toStoredTechnology(data);
}
