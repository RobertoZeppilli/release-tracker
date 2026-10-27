import "server-only";

import { createHmac } from "node:crypto";
import { SLACK_ACCESS_URL, SlackAccessSchema } from "../domain/slack-oauth";
import type { Signer } from "../domain/slack-state";

// The server half of "Add to Slack" (#188): the signature of the `state`, and the one call that
// turns a `code` into a webhook.
//
// ⚠️ The credentials are **handed in** and not read here: no file under `src/modules` reads the
// environment, so this module stays importable by a test with no env file (`src/lib/slack-app.ts`).
// ⚠️ Nothing in this file returns the secret or puts it in a message: a secret in an error string
// is a secret in a log.

const TIMEOUT_MS = 10_000;

// Cut to a line like `sendToSlack` does, for the same reason: it is printed to the Developer.
const MAX_ERROR = 200;

// The three things a round needs. The `redirectUri` travels in both calls and must be identical in
// the two, because Slack compares it literally against the one it was told about.
export type SlackApp = { clientId: string; clientSecret: string; redirectUri: string };

// The key of the `state` signature is the client secret itself, so the round brings no second
// variable to set and to forget: it is a server secret that exists exactly when the round does, and
// it never leaves this process. The signature is over the payload only, which holds nothing secret.
export function slackStateSigner(clientSecret: string): Signer {
  return (payload) => createHmac("sha256", clientSecret).update(payload).digest("base64url");
}

// What the caller needs and nothing more: the webhook and the channel it was created for. The
// reason for a failure is kept as one word, for the page to turn into a sentence of its own.
export type ExchangeResult = { ok: true; webhook: { url: string; channel: string } } | { ok: false; error: string };

// The exchange of the `code`, which lives ten minutes. POST with the credentials in the body, as
// Slack's own documentation does it, and the **same** `redirect_uri` as the authorisation.
//
// ⚠️ Slack reports a failure with HTTP 200 and `ok: false`, so the body is read either way and
// validated with Zod: a shape that is not the documented one is not trusted into the database.
export async function exchangeSlackCode(app: SlackApp, code: string): Promise<ExchangeResult> {
  try {
    const response = await fetch(SLACK_ACCESS_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: app.clientId,
        client_secret: app.clientSecret,
        code,
        redirect_uri: app.redirectUri,
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
