import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Follow } from "../domain/current-version";

const FollowRowSchema = z.object({
  technology_id: z.uuid(),
  current_version: z.string().nullable(),
  current_version_declared_at: z.iso.datetime({ offset: true }).nullable(),
});

// Read with the Developer's own client: RLS returns their follows and nobody else's, so the query
// carries no `user_id` and cannot be pointed at another Developer.
export async function readFollows(db: SupabaseClient): Promise<Follow[]> {
  const { data, error } = await db
    .from("follows")
    .select("technology_id, current_version, current_version_declared_at");
  if (error) throw error;
  return z
    .array(FollowRowSchema)
    .parse(data)
    .map((row) => ({
      technologyId: row.technology_id,
      // The two columns travel together, so one being set is enough to read the pair.
      currentVersion:
        row.current_version && row.current_version_declared_at
          ? { version: row.current_version, declaredAt: new Date(row.current_version_declared_at) }
          : null,
    }));
}
