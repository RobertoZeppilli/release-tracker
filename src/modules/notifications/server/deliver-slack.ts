import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createTranslator, DEFAULT_LOCALE, dictionaryFor, type Locale, localePath, localeSchema } from "@/modules/i18n";
import { releasePath } from "@/modules/releases";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import { slackMessage } from "../domain/slack";
import { type PendingSlack, planSlackSend, type SlackRecipient } from "../domain/slack-plan";
import { sendToSlack, type SendToSlack } from "./send-slack";

// ⚠️ A Notification older than this is not news any more, so it is never sent: without a window, a
// Developer who pastes a webhook today would be handed a month of Releases they already read on the
// site (`docs/DECISIONI.md`). The ceiling is what keeps one run from holding the cron open.
const WINDOW_DAYS = 7;
const MAX_PER_RUN = 500;

const CandidateSchema = z.array(
  z.object({
    id: z.uuid(),
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

const SecretSchema = z.object({ slack_webhook_url: z.string() });

const SettingsSchema = z.object({ preferred_locale: localeSchema });

const PreferenceSchema = z.array(
  z.object({ event: NotificationEventSchema, channel: NotificationChannelSchema, enabled: z.boolean() }),
);

export type DeliverReport = { pending: number; sent: number; failed: number };

// ⚠️ The site's own address is **handed in** and not read from `@/env`: a module of this project
// never reads the environment, the job that calls it does (the same shape as the GitHub token in
// the Detection). A webhook has no page it was opened from, so the link has to be absolute.
export type DeliverOptions = { siteUrl: string; now?: Date; send?: SendToSlack };

// Sends the Slack message this run earned, one per run (`docs/DECISIONI.md`). Service role, because
// it reads `slack_webhook_url`, which no other client may read.
//
// ⚠️ A webhook that answers badly is written down as `failed` and the run ends without an error: a
// revoked webhook is not a broken job, which is a criterion of #172. There is no automatic retry
// either: a `failed` row means this Notification will not be sent again, and what the reader sees
// in `/settings` is the reason, so they fix the webhook rather than wait.
export async function deliverSlack(
  db: SupabaseClient,
  { siteUrl, now = new Date(), send = sendToSlack }: DeliverOptions,
): Promise<DeliverReport> {
  const since = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  // Unpaged on purpose and not by oversight: `MAX_PER_RUN` is a ceiling under the page, so the run
  // takes the oldest five hundred and leaves the rest to the next one (issue #190).
  const candidates = await db
    .from("notifications")
    .select("id, event, releases!inner (version, technologies!inner (name, slug)), notification_deliveries (channel)")
    .in("event", ["featured_release", "notable_release"])
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);
  if (candidates.error) throw candidates.error;

  const pending: PendingSlack[] = CandidateSchema.parse(candidates.data)
    .filter((row) => !row.notification_deliveries.some((delivery) => delivery.channel === "slack"))
    .map((row) => ({
      notificationId: row.id,
      event: row.event,
      technologyName: row.releases.technologies.name,
      slug: row.releases.technologies.slug,
      version: row.releases.version,
      url: "",
    }));
  if (pending.length === 0) return { pending: 0, sent: 0, failed: 0 };

  const recipient = await readRecipient(db);
  const one = planSlackSend(withUrls(pending, recipient?.locale ?? DEFAULT_LOCALE, siteUrl), recipient);
  if (!one) return { pending: pending.length, sent: 0, failed: 0 };

  const t = createTranslator(one.locale, dictionaryFor(one.locale));
  const result = await send(one.webhookUrl, slackMessage(t, one.lines));
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
  const counted = one.notificationIds.length;
  return { pending: pending.length, sent: result.ok ? counted : 0, failed: result.ok ? 0 : counted };
}

// The link is absolute and in the preferred language: a webhook has no page it was opened from, so
// neither the host nor the locale can be read from a request (ADR 0008).
function withUrls(pending: readonly PendingSlack[], locale: Locale, siteUrl: string): PendingSlack[] {
  return pending.map((one) => ({
    ...one,
    url: `${siteUrl}${localePath(locale, releasePath(one.slug, one.version))}`,
  }));
}

// The one channel this copy can send to, or null when there is none. Three single-row reads: the
// tables hold one row each now (issue #210), so none of them can outgrow a page.
async function readRecipient(db: SupabaseClient): Promise<SlackRecipient | null> {
  // The webhook first, from the table a client cannot read: with none there is nothing to send to,
  // and reading the settings and the preferences would be two queries for nothing.
  const secret = await db
    .from("notification_secrets")
    .select("slack_webhook_url")
    .not("slack_webhook_url", "is", null)
    .maybeSingle();
  if (secret.error) throw secret.error;
  if (secret.data === null) return null;
  const webhookUrl = SecretSchema.parse(secret.data).slack_webhook_url;

  // ⚠️ A missing row is the normal state of a webhook saved before `/settings` was ever opened, so
  // the absence is the declared starting point and not an error.
  const settings = await db.from("notification_settings").select("preferred_locale").maybeSingle();
  if (settings.error) throw settings.error;

  // The Plan was read beside this until issue #209, to tell a paid Developer from one inside the
  // trial. Slack is part of the one level of service now, so a webhook is the whole question.
  const saved = await db.from("notification_preferences").select("event, channel, enabled");
  if (saved.error) throw saved.error;

  return {
    webhookUrl,
    locale: settings.data === null ? DEFAULT_LOCALE : SettingsSchema.parse(settings.data).preferred_locale,
    preferences: PreferenceSchema.parse(saved.data),
  };
}
