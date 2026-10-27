import "server-only";

import { env } from "@/env";
import { serverEnv } from "@/env/server";
import type { SlackApp } from "@/modules/notifications/server";

// The credentials of the Slack app Verdict owns (#188), read here and not in the module: **no file
// under `src/modules` reads the environment**, so a module stays importable by a test that has no
// env file at all. The two integration suites proved the rule by breaking on it.

// The path Slack was told about, once, in the app's Redirect URLs.
export const SLACK_REDIRECT_PATH = "/slack/callback";

// Null is "the round does not exist here", which is the normal state in development and in the
// tests: Slack demands an HTTPS `redirect_uri` and `http://localhost:3000` can never be one, so
// there the manual webhook field is the only way in. The button is not drawn either.
export function slackApp(): SlackApp | null {
  const clientId = serverEnv.SLACK_CLIENT_ID;
  const clientSecret = serverEnv.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  // The site URL and not the request host: the two calls of the round must send the **same**
  // `redirect_uri`, Slack compares it literally, and a preview host is one Slack never heard of.
  return { clientId, clientSecret, redirectUri: new URL(SLACK_REDIRECT_PATH, env.NEXT_PUBLIC_SITE_URL).toString() };
}
