import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ClassificationStrategySchema } from "@/modules/releases";
import { CategorySchema } from "../domain/category";
import { SourceSchema, sourceKey } from "../domain/catalog-entry";
import type { StoredTechnology } from "../domain/plan-catalog-sync";

export const TECHNOLOGY_COLUMNS =
  "id, slug, name, description, category, classification_strategy, retired, sources (id, role, kind, config, etag)";

const TechnologyRowSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: CategorySchema,
  classification_strategy: ClassificationStrategySchema,
  retired: z.boolean(),
  sources: z.array(
    z.object({
      id: z.uuid(),
      role: z.string(),
      kind: z.string(),
      config: z.record(z.string(), z.unknown()),
      etag: z.string().nullable(),
    }),
  ),
});

// The database stores a Source as role + kind + a jsonb config; the domain sees one flat object.
// An embedded PostgREST list comes back in no particular order, and an `UPDATE` on one Source is
// enough to change it: sorting by role and kind keeps the Technology page stable.
export function toStoredTechnology(row: unknown): StoredTechnology {
  const technology = TechnologyRowSchema.parse(row);
  return {
    id: technology.id,
    slug: technology.slug,
    name: technology.name,
    description: technology.description,
    category: technology.category,
    classificationStrategy: technology.classification_strategy,
    retired: technology.retired,
    sources: technology.sources
      .map(({ id, role, kind, config, etag }) => ({ id, etag, ...SourceSchema.parse({ ...config, role, kind }) }))
      .sort((a, b) => (sourceKey(a) < sourceKey(b) ? -1 : 1)),
  };
}

export async function readStoredTechnologies(db: SupabaseClient): Promise<StoredTechnology[]> {
  const { data, error } = await db.from("technologies").select(TECHNOLOGY_COLUMNS);
  if (error) throw error;
  return z.array(z.unknown()).parse(data).map(toStoredTechnology);
}

export async function listActiveTechnologies(db: SupabaseClient): Promise<StoredTechnology[]> {
  const { data, error } = await db.from("technologies").select(TECHNOLOGY_COLUMNS).eq("retired", false).order("slug");
  if (error) throw error;
  return z.array(z.unknown()).parse(data).map(toStoredTechnology);
}
