import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createTranslator, DEFAULT_LOCALE, dictionaryFor, localePath, localeSchema } from "@/modules/i18n";
import { releasePath } from "@/modules/releases";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import type { Preference } from "../domain/preferences";
import { slackMessage } from "../domain/slack";
import { type PendingSlack, planSlackSends, type SlackRecipient } from "../domain/slack-plan";
import { sendToSlack, type SendToSlack } from "./send-slack";

// ⚠️ A Notification older than this is not news any more, so it is never sent: without a window, a
// Developer who pastes a webhook today would be handed a month of Releases they already read on the
// site (`docs/DECISIONI.md`). The ceiling is what keeps one run from holding the cron open.
const WINDOW_DAYS = 7;
const MAX_PER_RUN = 500;

const CandidateSchema = z.array(
  z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    // The job asks for the two Release events only, so the Digest cannot reach a line that has a
    // Release in it: the schema says the same thing the query says.
    event: NotificationEventSchema.extract(["featured_release", "notable_release"]),
    releases: z.object({
      version: z.string(),
      technologies: z.object({ name: z.string(), slug: z.string() }),
    }),
    notification_deliveries: z.array(z.object({ channel: NotificationChannelSchema })),
  }),
);

const SecretSchema = z.array(z.object({ user_id: z.uuid(), slack_webhook_url: z.string() }));

const SettingsSchema = z.array(
  z.object({
    user_id: z.uuid(),
    preferred_locale: localeSchema,
    external_trial_started_at: z.iso.datetime({ offset: true }).nullable(),
  }),
);

const PreferenceSchema = z.array(
  z.object({ user_id: z.uuid(), event: NotificationEventSchema, channel: NotificationChannelSchema, enabled: z.boolean() }),
);

const PlanSchema = z.array(z.object({ user_id: z.uuid(), plan: z.enum(["free", "pro", "team"]) }));

export type DeliverReport = { pending: number; sent: number; failed: number };

// ⚠️ The site's own address is **handed in** and not read from `@/env`: a module of this project
// never reads the environment, the job that calls it does (the same shape as the GitHub token in
// the Detection). A webhook has no page it was opened from, so the link has to be absolute.
export type DeliverOptions = { siteUrl: string; now?: Date; send?: SendToSlack };

// Sends the Slack messages this run earned, one per Developer (`docs/DECISIONI.md`). Service role,
// because it reads `slack_webhook_url`, which no other client may read.
//
// ⚠️ A webhook that answers badly is written down as `failed` and the run carries on: one revoked
// webhook must not cost every other Developer their Notifications, which is a criterion of #172.
// There is no automatic retry: a `failed` row means this Notification will not be sent again, and
// what the Developer sees in `/settings` is the reason, so they fix the webhook rather than wait.
export async function deliverSlack(
  db: SupabaseClient,
  { siteUrl, now = new Date(), send = sendToSlack }: DeliverOptions,
): Promise<DeliverReport> {
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const candidates = await db
    .from("notifications")
    .select("id, user_id, event, releases!inner (version, technologies!inner (name, slug)), notification_deliveries (channel)")
    .in("event", ["featured_release", "notable_release"])
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);
  if (candidates.error) throw candidates.error;

  const pending: PendingSlack[] = CandidateSchema.parse(candidates.data)
    .filter((row) => !row.notification_deliveries.some((delivery) => delivery.channel === "slack"))
    .map((row) => ({
      notificationId: row.id,
      userId: row.user_id,
      event: row.event,
      technologyName: row.releases.technologies.name,
      slug: row.releases.technologies.slug,
      version: row.releases.version,
      url: "",
    }));
  if (pending.length === 0) return { pending: 0, sent: 0, failed: 0 };

  const recipients = await readRecipients(db, [...new Set(pending.map((one) => one.userId))]);
  const sends = planSlackSends(withUrls(pending, recipients, siteUrl), recipients, now);

  let sent = 0;
  let failed = 0;
  for (const one of sends) {
    const t = createTranslator(one.locale, dictionaryFor(one.locale));
    const result = await send(one.webhookUrl, slackMessage(t, one.lines));
    if (result.ok) sent += one.notificationIds.length;
    else failed += one.notificationIds.length;
    const { error } = await db.from("notification_deliveries").upsert(
      one.notificationIds.map((notificationId) => ({
        notification_id: notificationId,
        channel: "slack" as const,
        status: result.ok ? ("sent" as const) : ("failed" as const),
        error: result.ok ? null : result.error,
        attempted_at: now.toISOString(),
      })),
      { onConflict: "notification_id,channel" },
    );
    if (error) throw error;
  }
  return { pending: pending.length, sent, failed };
}

// The link is absolute and in the Developer's preferred language: a webhook has no page it was
// opened from, so neither the host nor the locale can be read from a request (ADR 0008).
function withUrls(
  pending: readonly PendingSlack[],
  recipients: readonly SlackRecipient[],
  siteUrl: string,
): PendingSlack[] {
  const locales = new Map(recipients.map((recipient) => [recipient.userId, recipient.locale]));
  return pending.map((one) => {
    const locale = locales.get(one.userId);
    if (locale === undefined) return one;
    const path = localePath(locale, releasePath(one.slug, one.version));
    return { ...one, url: `${siteUrl}${path}` };
  });
}

async function readRecipients(db: SupabaseClient, userIds: readonly string[]): Promise<SlackRecipient[]> {
  // The webhooks first, from the table a client cannot read: whoever has none cannot be sent to, and
  // reading their settings, Plan and preferences would be three queries for nothing.
  const secrets = await db
    .from("notification_secrets")
    .select("user_id, slack_webhook_url")
    .in("user_id", userIds)
    .not("slack_webhook_url", "is", null);
  if (secrets.error) throw secrets.error;
  const webhooks = new Map(SecretSchema.parse(secrets.data).map((row) => [row.user_id, row.slack_webhook_url]));
  if (webhooks.size === 0) return [];

  const ids = [...webhooks.keys()];
  const settings = await db
    .from("notification_settings")
    .select("user_id, preferred_locale, external_trial_started_at")
    .in("user_id", ids);
  if (settings.error) throw settings.error;
  const rows = SettingsSchema.parse(settings.data);
  const [preferences, plans] = await Promise.all([
    db.from("notification_preferences").select("user_id, event, channel, enabled").in("user_id", ids),
    db.from("plans").select("user_id, plan").in("user_id", ids),
  ]);
  if (preferences.error) throw preferences.error;
  if (plans.error) throw plans.error;

  const byUser = new Map<string, Preference[]>();
  for (const row of PreferenceSchema.parse(preferences.data)) {
    byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), { event: row.event, channel: row.channel, enabled: row.enabled }]);
  }
  const paid = new Map(PlanSchema.parse(plans.data).map((row) => [row.user_id, row.plan !== "free"]));

  // Keyed by the webhooks and not by the settings: a Developer who saved a webhook before ever
  // touching `/settings` has no settings row, and the declared starting point is what holds then.
  return ids.map((userId) => {
    const row = rows.find((one) => one.user_id === userId);
    return {
      userId,
      webhookUrl: webhooks.get(userId) ?? "",
      locale: row?.preferred_locale ?? DEFAULT_LOCALE,
      pro: paid.get(userId) ?? false,
      trialStartedAt: row?.external_trial_started_at ? new Date(row.external_trial_started_at) : null,
      preferences: byUser.get(userId) ?? [],
    };
  });
}
