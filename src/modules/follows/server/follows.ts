import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Follow } from "../domain/current-version";

const FollowRowSchema = z.object({
  technology_id: z.uuid(),
  current_version: z.string().nullable(),
  current_version_declared_at: z.iso.datetime({ offset: true }).nullable(),
});

// Read with the browser's own client. The query names nobody because there is nobody to name: an
// installed copy belongs to one person, so the table holds their follows and no others (issue #210,
// ADR 0011).
//
// Unpaged: nobody can follow more Technologies than the Catalog holds, which is sixty (issue #190).
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
