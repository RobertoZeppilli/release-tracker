import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { DEFAULT_LOCALE } from "@/modules/i18n";
import {
  generateNotifications,
  pruneNotifications,
  readNotificationSettings,
  RETENTION_DAYS,
  writePreference,
  writePreferredLocale,
} from "@/modules/notifications/server";
import { anonClient, clearFollows, type Content, deleteContent, seedContent, serviceClient } from "./supabase";

const PERMISSION_DENIED = "42501";

const SeenRowSchema = z.object({ seen_at: z.string() });

const NotificationRowsSchema = z.array(
  z.object({ id: z.uuid(), event: z.string(), release_id: z.uuid().nullable() }),
);

// ⚠️ **One reader, and the tables to match.** Since issue #210 a Notification, a preference and the
// preferred language belong to the installed copy and not to an account, so these tests have no
// second Developer to be invisible to: what they prove is the rule and the grant, which is what is
// left when the policy goes (ADR 0011).
let content: Content;

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

async function notifications() {
  const { data, error } = await serviceClient().from("notifications").select("id, event, release_id");
  if (error) throw error;
  return NotificationRowsSchema.parse(data);
}

beforeAll(async () => {
  content = await seedContent();
  const { error } = await serviceClient().from("follows").insert({ technology_id: content.technologyId });
  if (error) throw error;
});

afterAll(async () => {
  await clearFollows();
  await deleteContent(content);
});

beforeEach(async () => {
  const db = serviceClient();
  const cleared = await db.from("notifications").delete().not("id", "is", null);
  if (cleared.error) throw cleared.error;
  const preferences = await db.from("notification_preferences").delete().not("event", "is", null);
  if (preferences.error) throw preferences.error;
  await setSummaryStatus("pending");
});

describe("generateNotifications", () => {
  it("writes nothing while the Summary is still coming", async () => {
    const report = await generateNotifications(serviceClient());
    expect(report.planned).toBe(0);
    expect(await notifications()).toEqual([]);
  });

  it("writes one for a Release of a followed Technology", async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());

    const written = await notifications();
    expect(written).toHaveLength(1);
    expect(written[0]).toMatchObject({ event: "featured_release", release_id: content.releaseId });
  });

  it("writes none when the Technology is not followed", async () => {
    await clearFollows();
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
    expect(await notifications()).toEqual([]);

    const { error } = await serviceClient().from("follows").insert({ technology_id: content.technologyId });
    if (error) throw error;
  });

  it("writes one even when the Summary will never arrive", async () => {
    await setSummaryStatus("unavailable");
    await generateNotifications(serviceClient());
    expect(await notifications()).toHaveLength(1);
  });

  it("does not duplicate when the job runs twice", async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
    await generateNotifications(serviceClient());
    expect(await notifications()).toHaveLength(1);
  });

  it("respects the event switched off on every channel", async () => {
    await setSummaryStatus("ready");
    const { error } = await serviceClient()
      .from("notification_preferences")
      .insert(
        ["in_app", "slack", "email"].map((channel) => ({
          event: "featured_release",
          channel,
          enabled: false,
        })),
      );
    if (error) throw error;

    await generateNotifications(serviceClient());
    expect(await notifications()).toEqual([]);
  });
});

describe("what the browser may do with a Notification", () => {
  beforeEach(async () => {
    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
  });

  it("reads them with the publishable key", async () => {
    const { data, error } = await anonClient().from("notifications").select("id, event, release_id");
    expect(error).toBeNull();
    expect(NotificationRowsSchema.parse(data)).toHaveLength(1);
  });

  it("marks one Seen, which is what the bell's counter reads", async () => {
    const seen = new Date().toISOString();
    const [one] = await notifications();
    const { error } = await anonClient().from("notifications").update({ seen_at: seen }).eq("id", one.id);
    expect(error).toBeNull();

    const row = await serviceClient().from("notifications").select("seen_at").eq("id", one.id).single();
    // Compared as instants: Postgres hands back `+00:00` and its own precision, not the `Z` sent.
    expect(new Date(SeenRowSchema.parse(row.data).seen_at).getTime()).toBe(new Date(seen).getTime());
  });

  // `seen_at` is the one column of the grant, so the event, the Release and the day a Notification
  // was born stay the job's. This is what is left of the lock once the policy goes (issue #210).
  it("cannot rewrite the event, the Release or the day it was born", async () => {
    const [one] = await notifications();
    const { error } = await anonClient()
      .from("notifications")
      .update({ event: "weekly_digest" })
      .eq("id", one.id);
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("cannot write one for itself: only the jobs do", async () => {
    const { error } = await anonClient()
      .from("notifications")
      .insert({ event: "featured_release", release_id: content.releaseId });
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});

// What `/settings` writes and reads back (issue #171). The two statements are the ones the Server
// Actions run, taken as functions so the write can be proved against the real database: what the
// action adds around them is the validation of the form, which does not exist without a request.
describe("the Notification settings saved on this copy", () => {
  beforeEach(async () => {
    const cleared = await serviceClient()
      .from("notification_settings")
      .delete()
      .not("singleton", "is", null);
    if (cleared.error) throw cleared.error;
  });

  it("reads the declared starting point while nothing was ever saved", async () => {
    const settings = await readNotificationSettings(anonClient());
    expect(settings).toEqual({
      preferredLocale: DEFAULT_LOCALE,
      // No webhook saved, which is what keeps the Slack switches of #172 sending nothing.
      slackHint: null,
      preferences: [],
    });
  });

  it("holds a switch across a reload, and the job obeys it", async () => {
    await writePreference(anonClient(), {
      event: "featured_release",
      channel: "in_app",
      enabled: false,
    });

    // The reload: a second read, with nothing kept in between.
    const settings = await readNotificationSettings(anonClient());
    expect(settings.preferences).toEqual([
      { event: "featured_release", channel: "in_app", enabled: false },
    ]);

    await setSummaryStatus("ready");
    await generateNotifications(serviceClient());
    expect(await notifications()).toEqual([]);
  });

  it("writes one row however many times the switch is pressed", async () => {
    for (const enabled of [false, true, false]) {
      await writePreference(anonClient(), { event: "notable_release", channel: "in_app", enabled });
    }
    const settings = await readNotificationSettings(anonClient());
    expect(settings.preferences).toEqual([
      { event: "notable_release", channel: "in_app", enabled: false },
    ]);
  });

  it("saves the preferred language, creating the row, and reads it back", async () => {
    await writePreferredLocale(anonClient(), "de");
    expect((await readNotificationSettings(anonClient())).preferredLocale).toBe("de");
    await writePreferredLocale(anonClient(), "fr");
    expect((await readNotificationSettings(anonClient())).preferredLocale).toBe("fr");
  });

  // The settings are one row, so a second save finds the first instead of making a second: the
  // `singleton` primary key is what says so, and nothing else could (issue #210).
  it("keeps the settings to one row however often they are saved", async () => {
    await writePreferredLocale(anonClient(), "de");
    await writePreferredLocale(anonClient(), "es");
    const { data, error } = await serviceClient().from("notification_settings").select("preferred_locale");
    expect(error).toBeNull();
    expect(z.array(z.object({ preferred_locale: z.string() })).parse(data)).toEqual([
      { preferred_locale: "es" },
    ]);
  });

  // ⚠️ The audit of 2026-11-02, and the column grant that came out of it: what the reader may change
  // is the language, and the hint is the proof. It is what `/settings` prints about the Slack
  // channel, and only the application that saved the webhook may establish it.
  it("does not let the browser write the Slack hint", async () => {
    const seeded = await serviceClient()
      .from("notification_settings")
      .upsert({ singleton: true, preferred_locale: "en" }, { onConflict: "singleton" });
    if (seeded.error) throw seeded.error;

    const faked = await anonClient()
      .from("notification_settings")
      .update({ slack_webhook_hint: "hooks.slack.com/…9999" })
      .eq("singleton", true);
    expect(faked.error?.code).toBe(PERMISSION_DENIED);

    expect((await readNotificationSettings(anonClient())).slackHint).toBeNull();
  });
});

describe("pruneNotifications", () => {
  it("deletes what is older than the retention and keeps the rest", async () => {
    const db = serviceClient();
    const old = new Date(Date.now() - (RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString();
    const inserted = await db.from("notifications").insert([
      { event: "weekly_digest", digest_week: "2020-W01", created_at: old },
      // Both rows carry `created_at`: in a bulk insert PostgREST fills a key missing from one row
      // with null instead of the column default, and the column is not nullable.
      { event: "weekly_digest", digest_week: "2026-W43", created_at: new Date().toISOString() },
    ]);
    if (inserted.error) throw inserted.error;

    expect(await pruneNotifications(db)).toBe(1);
    const left = await notifications();
    expect(left.map((row) => row.event)).toEqual(["weekly_digest"]);
  });
});
