import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DEFAULT_LOCALE, type Locale, localeSchema } from "@/modules/i18n";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import type { Preference } from "../domain/preferences";

const SettingsRowSchema = z.object({
  preferred_locale: localeSchema,
  external_trial_started_at: z.iso.datetime({ offset: true }).nullable(),
});

const PreferenceRowSchema = z.array(
  z.object({ event: NotificationEventSchema, channel: NotificationChannelSchema, enabled: z.boolean() }),
);

export type NotificationSettings = {
  preferredLocale: Locale;
  // Null is "no external channel was ever switched on", which is the whole trial still in hand, and
  // not "the trial is over": `trialOf` is what turns the two into the lines `/settings` prints.
  externalTrialStartedAt: Date | null;
  // Only the rows actually saved. Everything absent is the declared starting point, which
  // `domain/preferences` holds and both this page and the job read through `isEnabled`.
  preferences: Preference[];
};

// Read with the Developer's own client, as `readFollows` is: RLS returns their two rows and nobody
// else's, so neither query carries a `user_id` and neither can be pointed at another Developer.
//
// ⚠️ A missing `notification_settings` row is the normal state of a Developer who has never touched
// their settings: no trigger creates one (see the migration of #169), so this returns the declared
// starting point instead of treating the absence as an error.
export async function readNotificationSettings(db: SupabaseClient): Promise<NotificationSettings> {
  const [settings, preferences] = await Promise.all([
    db.from("notification_settings").select("preferred_locale, external_trial_started_at").maybeSingle(),
    db.from("notification_preferences").select("event, channel, enabled"),
  ]);
  if (settings.error) throw settings.error;
  if (preferences.error) throw preferences.error;

  const row = settings.data === null ? null : SettingsRowSchema.parse(settings.data);
  return {
    preferredLocale: row?.preferred_locale ?? DEFAULT_LOCALE,
    externalTrialStartedAt: row?.external_trial_started_at ? new Date(row.external_trial_started_at) : null,
    preferences: PreferenceRowSchema.parse(preferences.data),
  };
}
