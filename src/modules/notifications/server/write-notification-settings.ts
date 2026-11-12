import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "@/modules/i18n";
import type { Preference } from "../domain/preferences";

// The two writes of `/settings`, as statements and nothing else: the Server Actions around them
// validate the form, which is what cannot be tested without a request, and these are what the
// integration test runs against the real database.
//
// ⚠️ No identity travels in either of them, and none can: the tables hold one row per event and
// channel, and one row full stop, because an installed copy belongs to one person (issue #210,
// ADR 0011). What used to bind a row to a Developer -- the column, the policy and the `with check`
// around it -- went with the login.

export async function writePreference(
  db: SupabaseClient,
  { event, channel, enabled }: Preference,
): Promise<void> {
  // Upsert on the primary key, so a switch pressed twice is one row with a new value instead of a
  // duplicate key: the table is keyed by event and channel.
  const { error } = await db
    .from("notification_preferences")
    .upsert(
      { event, channel, enabled, updated_at: new Date().toISOString() },
      { onConflict: "event,channel" },
    );
  if (error) throw error;
}

// `singleton` is the primary key of a table that holds one row: it is a column with one legal
// value, so the upsert has a conflict target to name and the second save finds the first.
export async function writePreferredLocale(db: SupabaseClient, locale: Locale): Promise<void> {
  const { error } = await db
    .from("notification_settings")
    .upsert(
      { singleton: true, preferred_locale: locale, updated_at: new Date().toISOString() },
      { onConflict: "singleton" },
    );
  if (error) throw error;
}

// The webhook and its hint travel together but live apart: the URL in `notification_secrets`, which
// no client may read or write, and the hint beside the settings, which is what the reader reads
// back (#172). Null on both is "remove the webhook".
//
// ⚠️ **The service role, not the browser's client**, unlike the two writes above: the secrets table
// grants a client nothing at all, which is the point of it.
export async function writeSlackWebhook(
  db: SupabaseClient,
  webhook: { url: string; hint: string } | null,
): Promise<void> {
  const now = new Date().toISOString();
  const secret = await db
    .from("notification_secrets")
    .upsert({ singleton: true, slack_webhook_url: webhook?.url ?? null, updated_at: now }, { onConflict: "singleton" });
  if (secret.error) throw secret.error;

  // The hint second: a hint without its URL would promise a channel that sends nothing, while a URL
  // whose hint did not land sends correctly and prints nothing, which is the better half to fail on.
  const { error } = await db
    .from("notification_settings")
    .upsert({ singleton: true, slack_webhook_hint: webhook?.hint ?? null, updated_at: now }, { onConflict: "singleton" });
  if (error) throw error;
}
