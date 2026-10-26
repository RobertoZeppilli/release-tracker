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

// ⚠️ The 30 day trial starts at the **first** switch of an external channel, never at sign-up
// (ADR 0009), so this is read before it is written: a second switch must not push the end date
// forward, which is what a plain upsert of `now()` would do every time.
export async function startExternalTrial(db: SupabaseClient, userId: string, now: Date): Promise<void> {
  const existing = await db.from("notification_settings").select("external_trial_started_at").maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.external_trial_started_at) return;
  const { error } = await db
    .from("notification_settings")
    .upsert(
      { user_id: userId, external_trial_started_at: now.toISOString(), updated_at: now.toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

// The webhook and its hint travel together but live apart: the URL in `notification_secrets`, which
// no client may read or write, and the hint beside the settings, which is what the Developer reads
// back (#172). Null on both is "remove the webhook".
//
// ⚠️ **The service role, not the Developer's client**, unlike the two writes above: the secrets
// table grants a client nothing at all, which is the point of it. The identity still comes from the
// request cookies in the Server Action and never from the form.
export async function writeSlackWebhook(
  db: SupabaseClient,
  userId: string,
  webhook: { url: string; hint: string } | null,
): Promise<void> {
  const now = new Date().toISOString();
  const secret = await db
    .from("notification_secrets")
    .upsert({ user_id: userId, slack_webhook_url: webhook?.url ?? null, updated_at: now }, { onConflict: "user_id" });
  if (secret.error) throw secret.error;

  // The hint second: a hint without its URL would promise a channel that sends nothing, while a URL
  // whose hint did not land sends correctly and prints nothing, which is the better half to fail on.
  const { error } = await db
    .from("notification_settings")
    .upsert({ user_id: userId, slack_webhook_hint: webhook?.hint ?? null, updated_at: now }, { onConflict: "user_id" });
  if (error) throw error;
}
