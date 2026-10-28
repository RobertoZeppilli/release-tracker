import type { SupabaseClient } from "@supabase/supabase-js";

// A Notification is kept 90 days (ADR 0009), and the privacy notice says so: a retention declared on
// a public page and not applied is a page that lies, so the deletion runs with the daily job.
export const RETENTION_DAYS = 90;

// The returned rows are the count of what was deleted, and they are not capped: measured against the
// local database, `max_rows` holds for a `select` and not for what a mutation gives back, so a run
// that deletes more than a thousand still reports them all (issue #190).
export async function pruneNotifications(db: SupabaseClient, now: Date = new Date()): Promise<number> {
  const before = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db.from("notifications").delete().lt("created_at", before).select("id");
  if (error) throw error;
  return data?.length ?? 0;
}
