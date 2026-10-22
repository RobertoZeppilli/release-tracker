import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SignificanceSchema, SummaryStatusSchema } from "@/modules/releases";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import { planReleaseNotifications, type ReleaseCandidate } from "../domain/plan";
import type { Preference } from "../domain/preferences";

// How far back a run looks. A Notification is about something that just happened, and the Catalog
// holds years of Releases: without a window the first run would hand every Developer a wall of
// Releases they already know about, and the 90 day cleanup would delete them anyway.
const WINDOW_DAYS = 7;

const CandidateSchema = z.array(
  z.object({
    id: z.uuid(),
    technology_id: z.uuid(),
    significance: SignificanceSchema,
    significance_override: SignificanceSchema.nullable(),
    // Shares the Release's primary key, so it embeds as one object or null.
    summaries: z.object({ status: SummaryStatusSchema }).nullable(),
  }),
);

const FollowerSchema = z.array(z.object({ user_id: z.uuid(), technology_id: z.uuid() }));

const PreferenceSchema = z.array(
  z.object({ user_id: z.uuid(), event: NotificationEventSchema, channel: NotificationChannelSchema, enabled: z.boolean() }),
);

export type GenerateReport = { considered: number; planned: number };

// Writes the Notifications the Releases of the last few days earned (ADR 0009). Server only: it runs
// inside the jobs, never from a client.
//
// Running it twice is harmless by construction, not by checking first: the insert ignores conflicts,
// and the two unique indexes on `notifications` are what makes a second run write nothing. That is
// also why this is a step of its own rather than a hook where a Summary settles, since `unavailable`
// and `skipped` are set when a Release is born, far from where `ready` and `failed` are decided.
export async function generateNotifications(db: SupabaseClient, now: Date = new Date()): Promise<GenerateReport> {
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const releases = await db
    .from("releases")
    .select("id, technology_id, significance, significance_override, summaries (status)")
    .gte("created_at", since);
  if (releases.error) throw releases.error;

  const candidates: ReleaseCandidate[] = CandidateSchema.parse(releases.data).flatMap((row) =>
    row.summaries === null
      ? []
      : [
          {
            releaseId: row.id,
            technologyId: row.technology_id,
            significance: row.significance_override ?? row.significance,
            summaryStatus: row.summaries.status,
          },
        ],
  );
  if (candidates.length === 0) return { considered: 0, planned: 0 };

  const technologyIds = [...new Set(candidates.map((candidate) => candidate.technologyId))];
  const follows = await db.from("follows").select("user_id, technology_id").in("technology_id", technologyIds);
  if (follows.error) throw follows.error;
  const followers = FollowerSchema.parse(follows.data).map((row) => ({
    userId: row.user_id,
    technologyId: row.technology_id,
  }));
  if (followers.length === 0) return { considered: candidates.length, planned: 0 };

  const userIds = [...new Set(followers.map((follower) => follower.userId))];
  const saved = await db
    .from("notification_preferences")
    .select("user_id, event, channel, enabled")
    .in("user_id", userIds);
  if (saved.error) throw saved.error;
  const preferences = new Map<string, Preference[]>();
  for (const row of PreferenceSchema.parse(saved.data)) {
    const mine = preferences.get(row.user_id) ?? [];
    mine.push({ event: row.event, channel: row.channel, enabled: row.enabled });
    preferences.set(row.user_id, mine);
  }

  const planned = planReleaseNotifications({ candidates, followers, preferences });
  if (planned.length === 0) return { considered: candidates.length, planned: 0 };

  // No `onConflict`: the two indexes that keep a Notification unique are partial, and a bare
  // `on conflict do nothing` covers both without naming either.
  const { error } = await db.from("notifications").upsert(
    planned.map((notification) => ({
      user_id: notification.userId,
      event: notification.event,
      release_id: notification.releaseId,
    })),
    { ignoreDuplicates: true },
  );
  if (error) throw error;
  return { considered: candidates.length, planned: planned.length };
}
