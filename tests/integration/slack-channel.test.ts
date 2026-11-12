import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { deliverSlack, generateNotifications, writeSlackWebhook } from "@/modules/notifications/server";
import type { SendResult } from "@/modules/notifications/server";
import { anonClient, clearFollows, type Content, deleteContent, seedContent, serviceClient } from "./supabase";

const PERMISSION_DENIED = "42501";

const SITE = "https://example.test";
const GOOD = "https://hooks.slack.com/services/T0/B0/good";
const BROKEN = "https://hooks.slack.com/services/T0/B0/brok";

const DeliveryRowsSchema = z.array(
  z.object({ notification_id: z.uuid(), channel: z.string(), status: z.string(), error: z.string().nullable() }),
);

let content: Content;

// A Slack that answers: it takes everything but the one webhook that is meant to be broken, which is
// how a revoked webhook behaves in life. What it was asked to send is kept, so the test can read the
// one message a run produced instead of guessing at it.
function fakeSlack() {
  const sent: { url: string; text: string }[] = [];
  return {
    sent,
    send: async (url: string, text: string): Promise<SendResult> => {
      sent.push({ url, text });
      return url === BROKEN ? { ok: false, error: "invalid_token" } : { ok: true };
    },
  };
}

async function switchSlackOn(): Promise<void> {
  const { error } = await serviceClient()
    .from("notification_preferences")
    .upsert(
      { event: "featured_release", channel: "slack", enabled: true },
      { onConflict: "event,channel" },
    );
  if (error) throw error;
}

async function deliveries() {
  const { data, error } = await serviceClient()
    .from("notifications")
    .select("id, notification_deliveries (notification_id, channel, status, error)");
  if (error) throw error;
  return DeliveryRowsSchema.parse((data ?? []).flatMap((row) => row.notification_deliveries));
}

beforeAll(async () => {
  content = await seedContent();
  const db = serviceClient();
  const follows = await db.from("follows").insert({ technology_id: content.technologyId });
  if (follows.error) throw follows.error;
  const summary = await db
    .from("summaries")
    .update({
      status: "ready",
      content: { title: "Nothing here is read.", keyPoints: [] },
      model: "claude-opus-5",
      prompt_version: "v1",
    })
    .eq("release_id", content.releaseId);
  if (summary.error) throw summary.error;
});

afterAll(async () => {
  await clearFollows();
  await writeSlackWebhook(serviceClient(), null);
  await deleteContent(content);
});

beforeEach(async () => {
  const db = serviceClient();
  const cleared = await db.from("notifications").delete().not("id", "is", null);
  if (cleared.error) throw cleared.error;
  const preferences = await db.from("notification_preferences").delete().not("event", "is", null);
  if (preferences.error) throw preferences.error;
  await writeSlackWebhook(db, { url: GOOD, hint: "hooks.slack.com/…good" });
  await switchSlackOn();
  await generateNotifications(db);
});

describe("the webhook as a secret", () => {
  it("is not readable by the browser: the secrets table grants a client nothing", async () => {
    const { error } = await anonClient().from("notification_secrets").select("slack_webhook_url");
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("is not writable by a client either, so a webhook can only be saved through the action", async () => {
    const { error } = await anonClient()
      .from("notification_secrets")
      .insert({ singleton: true, slack_webhook_url: GOOD });
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  // ⚠️ The regression this table exists for: `insert ... on conflict do update` needs `select` on
  // the whole table, so keeping the secret in `notification_settings` behind a narrower grant broke
  // every upsert the browser's own client makes there, the preferred language among them.
  it("leaves the browser's own upserts on the settings working", async () => {
    const { error } = await anonClient()
      .from("notification_settings")
      .upsert({ singleton: true, preferred_locale: "de" }, { onConflict: "singleton" });
    expect(error).toBeNull();
  });

  it("leaves the hint readable, which is what `/settings` prints", async () => {
    const { data, error } = await anonClient()
      .from("notification_settings")
      .select("slack_webhook_hint")
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.slack_webhook_hint).toBe("hooks.slack.com/…good");
  });
});

describe("deliverSlack", () => {
  it("gathers the run into one message, to the saved webhook", async () => {
    const slack = fakeSlack();
    const report = await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(report.sent).toBe(1);
    expect(report.failed).toBe(0);
    expect(slack.sent.map((one) => one.url)).toEqual([GOOD]);
    expect(await deliveries()).toMatchObject([{ channel: "slack", status: "sent", error: null }]);
  });

  // ⚠️ A revoked webhook is written down and the run ends without an error: a `failed` row is what
  // `/settings` then prints, so the reason is read there rather than waited for (#172).
  it("writes down what a broken webhook answered, without failing the run", async () => {
    await writeSlackWebhook(serviceClient(), { url: BROKEN, hint: "hooks.slack.com/…brok" });
    const slack = fakeSlack();
    const report = await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(report.failed).toBe(1);
    expect(await deliveries()).toMatchObject([
      { channel: "slack", status: "failed", error: "invalid_token" },
    ]);
  });

  it("sends nothing a second time: the delivery is what makes the run idempotent", async () => {
    const first = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: first.send });
    const second = fakeSlack();
    const report = await deliverSlack(serviceClient(), { siteUrl: SITE, send: second.send });

    expect(second.sent).toEqual([]);
    expect(report.pending).toBe(0);
  });

  it("sends nothing once the webhook is removed", async () => {
    await writeSlackWebhook(serviceClient(), null);
    const slack = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(slack.sent).toEqual([]);
    expect(await deliveries()).toEqual([]);
  });

  it("writes the message in the preferred language, with the grammar in English", async () => {
    const { error } = await serviceClient()
      .from("notification_settings")
      .update({ preferred_locale: "it" })
      .eq("singleton", true);
    if (error) throw error;

    const slack = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });
    const message = slack.sent.find((one) => one.url === GOOD)?.text ?? "";

    expect(message).toContain("Release");
    expect(message).toContain("featured ·");
  });
});
