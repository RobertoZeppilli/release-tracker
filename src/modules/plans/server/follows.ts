import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const FollowRowSchema = z.object({ technology_id: z.uuid() });

// Read with the Developer's own client: RLS returns their follows and nobody else's, so the query
// carries no `user_id` and cannot be pointed at another Developer.
export async function readFollows(db: SupabaseClient): Promise<string[]> {
  const { data, error } = await db.from("follows").select("technology_id");
  if (error) throw error;
  return z.array(FollowRowSchema).parse(data).map((row) => row.technology_id);
}
