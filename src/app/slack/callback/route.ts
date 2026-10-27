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
  if (!exchanged.ok) return back(origin, state.locale, "failed");

  const { url, channel } = exchanged.webhook;
  // The channel **by name**, which is what the page then prints: the pasted URL could only ever say
  // `hooks.slack.com/…4321` about itself, because nobody had told it where it went (#172, #188).
  const hint = channelHint(channel);
  try {
    await writeSlackWebhook(createServiceClient(), state.userId, { url, hint });
  } catch {
    return back(origin, state.locale, "failed");
  }
  // The name is not passed back in the URL: the page reads the hint from the database on the next
  // paint, which is also the proof that the write landed.
  return back(origin, state.locale, "connected");
}
