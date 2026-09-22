import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { ListedRelease } from "../domain/group-by-major";
import { SignificanceSchema } from "../domain/significance";

const ReleaseRowSchema = z.object({
  version: z.string(),
  significance: SignificanceSchema,
  significance_override: SignificanceSchema.nullable(),
  published_at: z.iso.datetime({ offset: true }),
});

// A Significance Override always wins over the Classification Strategy.
export async function listReleases(db: SupabaseClient, technologyId: string): Promise<ListedRelease[]> {
  const { data, error } = await db
    .from("releases")
    .select("version, significance, significance_override, published_at")
    .eq("technology_id", technologyId);
  if (error) throw error;
  return z
    .array(ReleaseRowSchema)
    .parse(data)
    .map((row) => ({
      version: row.version,
      significance: row.significance_override ?? row.significance,
      publishedAt: new Date(row.published_at),
    }));
}
