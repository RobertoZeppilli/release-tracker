import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DEFAULT_LOCALE, type Locale, localeSchema } from "@/modules/i18n";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import type { Preference } from "../domain/preferences";

const SettingsRowSchema = z.object({
  preferred_locale: localeSchema,
  // The hint and never the URL: `slack_webhook_url` lives in a table `anon` is granted nothing on,
  // so naming it here would fail the query rather than return a secret (#172).
  slack_webhook_hint: z.string().nullable(),
});

const PreferenceRowSchema = z.array(
  z.object({ event: NotificationEventSchema, channel: NotificationChannelSchema, enabled: z.boolean() }),
);

export type NotificationSettings = {
  preferredLocale: Locale;
  // Where the saved webhook points, as `webhookHint` writes it, or null when there is none.
  slackHint: string | null;
  // Only the rows actually saved. Everything absent is the declared starting point, which
  // `domain/preferences` holds and both this page and the job read through `isEnabled`.
  preferences: Preference[];
};

// Read with the browser's own client, as `readFollows` is: both tables hold the settings of the one
// person this copy is installed for (issue #210, ADR 0011), so neither query names anybody.
//
// ⚠️ A missing `notification_settings` row is the normal state of a copy whose settings have never
// been touched: no trigger creates one (see the migration of #169), so this returns the declared
// starting point instead of treating the absence as an error.
export async function readNotificationSettings(db: SupabaseClient): Promise<NotificationSettings> {
  const [settings, preferences] = await Promise.all([
    db
      .from("notification_settings")
      .select("preferred_locale, slack_webhook_hint")
      .maybeSingle(),
    // Unpaged: three events by three channels is nine rows at the very most (issue #190).
    db.from("notification_preferences").select("event, channel, enabled"),
  ]);
  if (settings.error) throw settings.error;
  if (preferences.error) throw preferences.error;

  const row = settings.data === null ? null : SettingsRowSchema.parse(settings.data);
  return {
    preferredLocale: row?.preferred_locale ?? DEFAULT_LOCALE,
    slackHint: row?.slack_webhook_hint ?? null,
    preferences: PreferenceRowSchema.parse(preferences.data),
  };
}
