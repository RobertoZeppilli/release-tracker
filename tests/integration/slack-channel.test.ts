import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { deliverSlack, generateNotifications, writeSlackWebhook } from "@/modules/notifications/server";
import type { SendResult } from "@/modules/notifications/server";
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

const SITE = "https://example.test";
const GOOD = "https://hooks.slack.com/services/T0/B0/good";
const BROKEN = "https://hooks.slack.com/services/T0/B0/brok";

const DeliveryRowsSchema = z.array(
  z.object({ notification_id: z.uuid(), channel: z.string(), status: z.string(), error: z.string().nullable() }),
);

let content: Content;
let alice: Developer;
let bob: Developer;

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

async function switchSlackOn(developer: Developer): Promise<void> {
  const { error } = await serviceClient()
    .from("notification_preferences")
    .upsert(
      { user_id: developer.id, event: "featured_release", channel: "slack", enabled: true },
      { onConflict: "user_id,event,channel" },
    );
  if (error) throw error;
}

async function deliveriesOf(developer: Developer) {
  const { data, error } = await serviceClient()
    .from("notifications")
    .select("id, notification_deliveries (notification_id, channel, status, error)")
    .eq("user_id", developer.id);
  if (error) throw error;
  return DeliveryRowsSchema.parse((data ?? []).flatMap((row) => row.notification_deliveries));
}

beforeAll(async () => {
  content = await seedContent();
  [alice, bob] = await Promise.all([createDeveloper(), createDeveloper()]);
  const db = serviceClient();
  // Both follow the Technology, so the run has something to send to each of them: that is what makes
  // "a broken webhook does not stop the others" a question this test can answer.
  const follows = await db.from("follows").insert([
    { user_id: alice.id, technology_id: content.technologyId },
    { user_id: bob.id, technology_id: content.technologyId },
  ]);
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
  await Promise.all([deleteDeveloper(alice), deleteDeveloper(bob)]);
  await deleteContent(content);
});

beforeEach(async () => {
  const db = serviceClient();
  const cleared = await db.from("notifications").delete().eq("release_id", content.releaseId);
  if (cleared.error) throw cleared.error;
  const preferences = await db.from("notification_preferences").delete().in("user_id", [alice.id, bob.id]);
  if (preferences.error) throw preferences.error;
  await Promise.all([
    writeSlackWebhook(db, alice.id, { url: GOOD, hint: "hooks.slack.com/…good" }),
    writeSlackWebhook(db, bob.id, { url: BROKEN, hint: "hooks.slack.com/…brok" }),
  ]);
  await Promise.all([switchSlackOn(alice), switchSlackOn(bob)]);
  await generateNotifications(db);
});

describe("the webhook as a secret", () => {
  it("is not readable by the Developer who saved it: the secrets table grants a client nothing", async () => {
    const { error } = await alice.client.from("notification_secrets").select("slack_webhook_url");
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  it("is not writable by a client either, so a webhook can only be saved through the action", async () => {
    const { error } = await alice.client
      .from("notification_secrets")
      .insert({ user_id: alice.id, slack_webhook_url: GOOD });
    expect(error?.code).toBe(PERMISSION_DENIED);
  });

  // ⚠️ The regression this table exists for: `insert ... on conflict do update` needs `select` on
  // the whole table, so keeping the secret in `notification_settings` behind a narrower grant broke
  // every upsert a Developer's own client makes there, the preferred language among them.
  it("leaves the Developer's own upserts on their settings working", async () => {
    const { error } = await alice.client
      .from("notification_settings")
      .upsert({ user_id: alice.id, preferred_locale: "de" }, { onConflict: "user_id" });
    expect(error).toBeNull();
  });

  it("leaves the Developer the hint, which is what `/settings` prints", async () => {
    const { data, error } = await alice.client
      .from("notification_settings")
      .select("slack_webhook_hint")
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.slack_webhook_hint).toBe("hooks.slack.com/…good");
  });
});

describe("deliverSlack", () => {
  it("sends one message per Developer, each to their own webhook", async () => {
    const slack = fakeSlack();
    const report = await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(report.sent).toBe(1);
    expect(report.failed).toBe(1);
    expect(slack.sent.map((one) => one.url).sort()).toEqual([BROKEN, GOOD].sort());
  });

  it("does not let a broken webhook cost the other Developer their Notification", async () => {
    const slack = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(await deliveriesOf(alice)).toMatchObject([{ channel: "slack", status: "sent", error: null }]);
    expect(await deliveriesOf(bob)).toMatchObject([{ channel: "slack", status: "failed", error: "invalid_token" }]);
  });

  it("sends nothing a second time: the delivery is what makes the run idempotent", async () => {
    const first = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: first.send });
    const second = fakeSlack();
    const report = await deliverSlack(serviceClient(), { siteUrl: SITE, send: second.send });

    expect(second.sent).toEqual([]);
    expect(report.pending).toBe(0);
  });

  it("sends nothing to a Developer who removed their webhook", async () => {
    await writeSlackWebhook(serviceClient(), bob.id, null);
    const slack = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });

    expect(slack.sent.map((one) => one.url)).toEqual([GOOD]);
    expect(await deliveriesOf(bob)).toEqual([]);
  });

  it("writes the message in the Developer's preferred language, with the grammar in English", async () => {
    const { error } = await serviceClient()
      .from("notification_settings")
      .update({ preferred_locale: "it" })
      .eq("user_id", alice.id);
    if (error) throw error;

    const slack = fakeSlack();
    await deliverSlack(serviceClient(), { siteUrl: SITE, send: slack.send });
    const message = slack.sent.find((one) => one.url === GOOD)?.text ?? "";

    expect(message).toContain("Release");
    expect(message).toContain("featured ·");
  });
});
