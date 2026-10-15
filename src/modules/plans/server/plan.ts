import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// The Plan names, as the database enum spells them (CONTEXT.md, Piano). `team` exists in the enum
// and nothing issues it yet; the schema still accepts it, because a reader of the row is not the
// place to discover a value the database already allows.
const PlanRowSchema = z.object({ plan: z.enum(["free", "pro", "team"]) });
export type PlanName = z.infer<typeof PlanRowSchema>["plan"];

// Read with the Developer's own client: RLS returns their row and nobody else's, so the query
// carries no `user_id` (the same shape `readFollows` uses). Every Developer has one, written by the
// `on_auth_user_created` trigger, so a missing row is a broken account and not a Developer on no
// Plan: it throws rather than guessing `free`.
export async function readPlan(db: SupabaseClient): Promise<PlanName> {
  const { data, error } = await db.from("plans").select("plan").single();
  if (error) throw error;
  return PlanRowSchema.parse(data).plan;
}
