import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import { SignificanceSchema, SummaryStatusSchema } from "@/modules/releases";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import { planReleaseNotifications, type ReleaseCandidate } from "../domain/plan";
import type { Preference } from "../domain/preferences";

// How far back a run looks, the same thirty days the Dashboard shows. A Notification is about
// something that just happened, and the Catalog holds years of Releases: without a window the first
// run would hand every Developer a wall of Releases they already know about.
//
// Thirty and not seven because a Notification is born when the Summary settles, and the Summary
// phases are run by hand: a Release whose Summary arrives a fortnight late would otherwise fall out
// of the window and never notify anyone.
const WINDOW_DAYS = 30;

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
  // Paged, and not because the window is usually small: after a `catalog:sync` every Release carries
  // the same `created_at`, so for thirty days the window holds the whole Catalog. Unpaged, the job
  // considered a thousand of them and ignored the rest without a word (issue #190).
  const releases = await selectAllRows((from, to) =>
    db
      .from("releases")
      .select("id, technology_id, significance, significance_override, summaries (status)")
      .gte("created_at", since)
      // By `id` and not by date: an import batch shares one `created_at`, and paging over a column
      // with ties can repeat or skip a row.
      .order("id")
      .range(from, to),
  );

  const candidates: ReleaseCandidate[] = CandidateSchema.parse(releases).flatMap((row) =>
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
  // One row per Technology followed per Developer, so it grows with the subscribers: paged, ordered
  // by the primary key, which is the only order without ties.
  const follows = await selectAllRows((from, to) =>
    db
      .from("follows")
      .select("user_id, technology_id")
      .in("technology_id", technologyIds)
      .order("user_id")
      .order("technology_id")
      .range(from, to),
  );
  const followers = FollowerSchema.parse(follows).map((row) => ({
    userId: row.user_id,
    technologyId: row.technology_id,
  }));
  if (followers.length === 0) return { considered: candidates.length, planned: 0 };

  const userIds = [...new Set(followers.map((follower) => follower.userId))];
  // Up to four rows per Developer, so a thousand rows is around two hundred and fifty subscribers.
  const saved = await selectAllRows((from, to) =>
    db
      .from("notification_preferences")
      .select("user_id, event, channel, enabled")
      .in("user_id", userIds)
      .order("user_id")
      .order("event")
      .order("channel")
      .range(from, to),
  );
  const preferences = new Map<string, Preference[]>();
  for (const row of PreferenceSchema.parse(saved)) {
    const mine = preferences.get(row.user_id) ?? [];
    mine.push({ event: row.event, channel: row.channel, enabled: row.enabled });
    preferences.set(row.user_id, mine);
  }

  const planned = planReleaseNotifications({ candidates, followers, preferences });
  if (planned.length === 0) return { considered: candidates.length, planned: 0 };

  // The three columns of `notifications_once_per_subject`, named so the insert becomes an
  // `on conflict (user_id, event, subject) do nothing`: without them PostgREST infers the primary
  // key, which is a fresh uuid and never conflicts, and the second run raises a duplicate key.
  // `subject` is generated by the database, so it is inferred here and never written.
  const { error } = await db.from("notifications").upsert(
    planned.map((notification) => ({
      user_id: notification.userId,
      event: notification.event,
      release_id: notification.releaseId,
    })),
    { onConflict: "user_id,event,subject", ignoreDuplicates: true },
  );
  if (error) throw error;
  return { considered: candidates.length, planned: planned.length };
}
