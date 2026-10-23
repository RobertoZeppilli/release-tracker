import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "@/modules/i18n";
import type { Preference } from "../domain/preferences";

// The two writes of `/settings`, as statements and nothing else: the Server Actions around them read
// the identity from the request cookies and validate the form, which is what cannot be tested
// without a request, and these are what the integration test runs against the real database.
//
// The client is the Developer's own, so RLS is what binds the row to them: `with check (user_id =
// auth.uid())` refuses a row written for anybody else even though the id travels in the statement.

export async function writePreference(
  db: SupabaseClient,
  userId: string,
  { event, channel, enabled }: Preference,
): Promise<void> {
  // Upsert on the primary key, so a switch pressed twice is one row with a new value instead of a
  // duplicate key: the table is keyed by Developer, event and channel.
  const { error } = await db
    .from("notification_preferences")
    .upsert(
      { user_id: userId, event, channel, enabled, updated_at: new Date().toISOString() },
      { onConflict: "user_id,event,channel" },
    );
  if (error) throw error;
}

export async function writePreferredLocale(db: SupabaseClient, userId: string, locale: Locale): Promise<void> {
  // ⚠️ `external_trial_started_at` is not named here, so a save of the language never starts or
  // moves the trial: only switching an external channel on may do that (ADR 0009, #172 and #173).
  const { error } = await db
    .from("notification_settings")
    .upsert(
      { user_id: userId, preferred_locale: locale, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}
