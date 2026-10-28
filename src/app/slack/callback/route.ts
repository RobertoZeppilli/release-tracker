import { NextResponse, type NextRequest } from "next/server";
import { slackApp } from "@/lib/slack-app";
import { createServiceClient } from "@/lib/supabase-server";
import { DEFAULT_LOCALE, type Locale, localePath } from "@/modules/i18n";
import { channelHint, readState } from "@/modules/notifications";
import { exchangeSlackCode, slackStateSigner, writeSlackWebhook } from "@/modules/notifications/server";

// The second half of "Add to Slack" (#188): Slack sends the Developer back with a `code`, the
// webhook is fetched with it, and `/settings` says which channel it reached.
//
// ⚠️ The identity comes from the **signed `state`** and never from the cookies of this request: a
// return that does not carry a `state` of ours is, in Slack's own words, to be treated as a forgery,
// and it is refused here rather than written to whoever happens to be signed in.
// ⚠️ The webhook itself is written with the service role and is never put in the redirect, in a log
// or in a message: `notification_secrets` grants a client nothing, which is the point of it (#172).
function back(origin: string, locale: Locale, outcome: string): NextResponse {
  const url = new URL(localePath(locale, "/settings"), origin);
  url.searchParams.set("slack", outcome);
  url.hash = "notifications";
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = request.nextUrl;
  const app = slackApp();
  if (!app) return back(origin, DEFAULT_LOCALE, "unavailable");

  // The `state` first, before anything else is read: until it is verified this request is nobody's.
  const raw = searchParams.get("state");
  const state = raw ? readState(raw, slackStateSigner(app.clientSecret), new Date()) : null;
  if (!state) return back(origin, DEFAULT_LOCALE, "denied");

  // "Cancel" on the consent screen comes back with an `error` and no `code`, and it is not a failure
  // of ours: the Developer changed their mind and the page says so plainly.
  const code = searchParams.get("code");
  if (!code) return back(origin, state.locale, "cancelled");

  const exchanged = await exchangeSlackCode(app, code);
  if (!exchanged.ok) {
    // The only trace a redirect can leave. `failed` is one sentence on the page and two different
    // realities here, and without this line the function log says nothing at all: the round is
    // unreproducible in development, where there are no credentials and Slack refuses localhost.
    // Slack's own word is what gets logged (`invalid_client_id`, `code_already_used`), never the
    // secret and never the webhook.
    console.error("slack oauth: exchange failed", exchanged.error);
    return back(origin, state.locale, "failed");
  }

  const { url, channel } = exchanged.webhook;
  // The channel **by name**, which is what the page then prints: the pasted URL could only ever say
  // `hooks.slack.com/…4321` about itself, because nobody had told it where it went (#172, #188).
  const hint = channelHint(channel);
  try {
    await writeSlackWebhook(createServiceClient(), state.userId, { url, hint });
  } catch (cause) {
    console.error("slack oauth: write failed", writeReason(cause));
    return back(origin, state.locale, "failed");
  }
  // The name is not passed back in the URL: the page reads the hint from the database on the next
  // paint, which is also the proof that the write landed.
  return back(origin, state.locale, "connected");
}

// The code and the sentence of a failed write and nothing else: `details` of a PostgREST error can
// carry the offending row, and that row holds the webhook. A PostgrestError is a plain object and
// not an `Error`, so both fields are read by name rather than through `instanceof`.
function writeReason(cause: unknown): string {
  if (typeof cause !== "object" || cause === null) return String(cause);
  const code = "code" in cause ? String(cause.code) : "";
  const message = "message" in cause ? String(cause.message) : "";
  return `${code} ${message}`.trim() || "unknown";
}
