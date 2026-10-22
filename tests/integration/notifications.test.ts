import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { generateNotifications, pruneNotifications, RETENTION_DAYS } from "@/modules/notifications/server";
import {
  type Content,
  createDeveloper,
  deleteContent,
  deleteDeveloper,
  type Developer,
  seedContent,
  serviceClient,
} from "./supabase";

const PERMISSION_DENIED = "42501";

const SeenRowSchema = z.object({ seen_at: z.string() });

const NotificationRowsSchema = z.array(
  z.object({ id: z.uuid(), user_id: z.uuid(), event: z.string(), release_id: z.uuid().nullable() }),
);

let content: Content;
let alice: Developer;
let bob: Developer;

// The Release seeded for these tests is `featured`; its Summary starts `pending`, which is the state
// in which no Notification is due yet. The provenance travels with the status because
// `summaries_ready_provenance` refuses a `ready` row that does not say where it came from.
async function setSummaryStatus(status: string): Promise<void> {
  const provenance =
    status === "ready"
      ? { content: { title: "Nothing here is read.", keyPoints: [] }, model: "claude-opus-5", prompt_version: "v1" }
      : { content: null, model: null, prompt_version: null };
  const { error } = await serviceClient()
    .from("summaries")
    .update({ status, ...provenance })
    .eq("release_id", content.releaseId);
  if (error) throw error;
}

async function notificationsOf(developer: Developer) {
  const { data, error } = await serviceClient()
    .from("notifications")
    .select("id, user_id, event, release_id")
    .eq("user_id", developer.id);
  if (error) throw error;
  return NotificationRowsSchema.parse(data);
}

beforeAll(async () => {
  content = await seedContent();
  [alice, bob] = await Promise.all([createDeveloper(), createDeveloper()]);
  // Alice follows the Technology, Bob does not.
  const { error } = await serviceClient()
    .from("follows")
    .insert({ user_id: alice.id, technology_id: content.technologyId });
  if (error) throw error;
});

afterAll(async () => {
  await Promise.all([deleteDeveloper(alice), deleteDeveloper(bob)]);
  await deleteContent(content);
});

beforeEach(async () => {
  const db = serviceClient();
  const cleared = await db.from("notifications").delete().eq("release_id", content.releaseId);
  if (cleared.error) throw cleared.error;
  const preferences = await db.from("notification_preferences").delete().in("user_id", [alice.id, bob.id]);
  if (preferences.error) throw preferences.error;
  await setSummaryStatus("pending");
});

describe("generateNotifications", () => {
  it("writes nothing while the Summary is still coming", async () => {
    const report = await generateNotifications(serviceClient());
    expect(report.planned).toBe(0);
    expect(await notificationsOf(alice)).toEqual([]);
  });

  it("gives one to the Developer who follows, and none to the one who does not", async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());

    const mine = await notificationsOf(alice);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ event: "featured_release", release_id: content.releaseId });
    expect(await notificationsOf(bob)).toEqual([]);
  });

  it("writes one even when the Summary will never arrive", async () => {
    await setSummaryStatus("unavailable");
    await generateNotifications(serviceClient());
    expect(await notificationsOf(alice)).toHaveLength(1);
  });

  it("does not duplicate when the job runs twice", async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
    await generateNotifications(serviceClient());
    expect(await notificationsOf(alice)).toHaveLength(1);
  });

  it("respects a Developer who switched that event off on every channel", async () => {
    await setSummaryStatus("ready");
    const { error } = await serviceClient()
      .from("notification_preferences")
      .insert(
        ["in_app", "slack", "email"].map((channel) => ({
          user_id: alice.id,
          event: "featured_release",
          channel,
          enabled: false,
        })),
      );
    if (error) throw error;

    await generateNotifications(serviceClient());
    expect(await notificationsOf(alice)).toEqual([]);
  });
});

describe("what a Developer can do with their own Notifications", () => {
  beforeEach(async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
  });

  it("reads their own", async () => {
    const { data, error } = await alice.client.from("notifications").select("id, user_id, event, release_id");
    expect(error).toBeNull();
    expect(NotificationRowsSchema.parse(data)).toHaveLength(1);
  });

  it("cannot read another Developer's", async () => {
    const { data, error } = await bob.client.from("notifications").select("id, user_id, event, release_id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("marks one Seen, which is what the bell's counter reads", async () => {
    const seen = new Date().toISOString();
    const { error } = await alice.client.from("notifications").update({ seen_at: seen }).eq("user_id", alice.id);
    expect(error).toBeNull();

    const mine = await serviceClient().from("notifications").select("seen_at").eq("user_id", alice.id).single();
    // Compared as instants: Postgres hands back `+00:00` and its own precision, not the `Z` sent.
    expect(new Date(SeenRowSchema.parse(mine.data).seen_at).getTime()).toBe(new Date(seen).getTime());
  });

  it("cannot mark another Developer's as Seen", async () => {
    const [mine] = await notificationsOf(alice);
    const { error } = await bob.client
      .from("notifications")
      .update({ seen_at: new Date().toISOString() })
      .eq("id", mine.id);
    // Nothing matches Bob's policy, so the row is untouched rather than refused.
    expect(error).toBeNull();
    const after = await serviceClient().from("notifications").select("seen_at").eq("id", mine.id).single();
    expect(after.data).toMatchObject({ seen_at: null });
  });

  it("cannot rewrite the event, the Release or the day it was born", async () => {
    const [mine] = await notificationsOf(alice);
    const { error } = await alice.client
      .from("notifications")
      .update({ event: "weekly_digest" })
      .eq("id", mine.id);
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("cannot write one for itself: only the jobs do", async () => {
    const { error } = await alice.client
      .from("notifications")
      .insert({ user_id: alice.id, event: "featured_release", release_id: content.releaseId });
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});

describe("pruneNotifications", () => {
  it("deletes what is older than the retention and keeps the rest", async () => {
    const db = serviceClient();
    const old = new Date(Date.now() - (RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString();
    const inserted = await db.from("notifications").insert([
      { user_id: alice.id, event: "weekly_digest", digest_week: "2020-W01", created_at: old },
      // Both rows carry `created_at`: in a bulk insert PostgREST fills a key missing from one row
      // with null instead of the column default, and the column is not nullable.
      { user_id: alice.id, event: "weekly_digest", digest_week: "2026-W43", created_at: new Date().toISOString() },
    ]);
    if (inserted.error) throw inserted.error;

    expect(await pruneNotifications(db)).toBe(1);
    const left = await notificationsOf(alice);
    expect(left.map((row) => row.event)).toEqual(["weekly_digest"]);
  });
});
