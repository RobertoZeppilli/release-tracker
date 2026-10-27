import "server-only";

import { createHmac } from "node:crypto";
import { env } from "@/env";
import { serverEnv } from "@/env/server";
import { SLACK_ACCESS_URL, SlackAccessSchema } from "../domain/slack-oauth";
import type { Signer } from "../domain/slack-state";

// The server half of "Add to Slack" (#188): the credentials of the Slack app, the signature of the
// `state`, and the one call that turns a `code` into a webhook.
//
// ⚠️ `SLACK_CLIENT_SECRET` is read here and nowhere else, and nothing in this file returns it or
// puts it in a message: a secret in an error string is a secret in a log.

const TIMEOUT_MS = 10_000;

// Cut to a line like `sendToSlack` does, for the same reason: it is printed to the Developer.
const MAX_ERROR = 200;

// The path Slack was told about, once, in the app's Redirect URLs. It is built from the site URL and
// not from the request host, because the two must be **identical** in the two calls of the round and
// Slack compares them literally; a preview host would also be a host Slack was never told about.
export const SLACK_REDIRECT_PATH = "/slack/callback";

export function slackRedirectUri(): string {
  return new URL(SLACK_REDIRECT_PATH, env.NEXT_PUBLIC_SITE_URL).toString();
}

// Both variables, or the round does not exist: the button is not drawn, and the two routes answer as
// if they were not there. In development they are unset on purpose, since the `redirect_uri` has to
// be HTTPS and `http://localhost:3000` can never be one: there the manual field is the only way in.
export function slackOauthCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = serverEnv.SLACK_CLIENT_ID;
  const clientSecret = serverEnv.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isSlackOauthEnabled(): boolean {
  return slackOauthCredentials() !== null;
}

// The key of the `state` signature is the client secret itself, so the round brings no second
// variable to set and to forget: it is a server secret that exists exactly when the round does, and
// it never leaves this process. The signature is over the payload only, which holds nothing secret.
export function slackStateSigner(clientSecret: string): Signer {
  return (payload) => createHmac("sha256", clientSecret).update(payload).digest("base64url");
}

// What the caller needs and nothing more: the webhook and the channel it was created for. The
// reason for the failure is kept as one word, for the page to turn into a sentence of its own.
export type ExchangeResult =
  | { ok: true; webhook: { url: string; channel: string } }
  | { ok: false; error: string };

// The exchange of the `code`, which lives ten minutes. POST with the credentials in the body, as
// Slack's own documentation does it, and the **same** `redirect_uri` as the authorisation.
//
// ⚠️ Slack reports a failure with HTTP 200 and `ok: false`, so the body is read either way and
// validated with Zod: a shape that is not the documented one is not trusted into the database.
export async function exchangeSlackCode(code: string): Promise<ExchangeResult> {
  const credentials = slackOauthCredentials();
  if (!credentials) return { ok: false, error: "disabled" };

  try {
    const response = await fetch(SLACK_ACCESS_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: slackRedirectUri(),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const parsed = SlackAccessSchema.safeParse(await response.json());
    if (!parsed.success) return { ok: false, error: "malformed" };
    if (!parsed.data.ok) return { ok: false, error: parsed.data.error.slice(0, MAX_ERROR) };
    const { url, channel } = parsed.data.incoming_webhook;
    return { ok: true, webhook: { url, channel } };
  } catch (cause) {
    return { ok: false, error: (cause instanceof Error ? cause.message : String(cause)).slice(0, MAX_ERROR) };
  }
}
