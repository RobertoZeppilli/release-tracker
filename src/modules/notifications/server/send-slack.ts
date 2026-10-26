import "server-only";

// How long a webhook has to answer. Slack answers in well under a second; this is the ceiling that
// keeps one dead endpoint from holding the whole run (the cron has a budget of its own).
const TIMEOUT_MS = 10_000;

// What a send answered. Never a thrown error: a broken webhook is an ordinary outcome of this job,
// recorded against that one Developer, and the run goes on for everybody else (#172).
export type SendResult = { ok: true } | { ok: false; error: string };

// Cut to a line, because it is printed to the Developer in `/settings`: Slack answers `invalid_token`
// or `no_service` in one word, but a proxy in the middle can answer a page of HTML.
const MAX_ERROR = 200;

export type SendToSlack = (webhookUrl: string, text: string) => Promise<SendResult>;

// The one place this module talks to Slack. Server only, as everything that holds a webhook is: the
// rule of `CLAUDE.md` is that no external call leaves the client.
export const sendToSlack: SendToSlack = async (webhookUrl, text) => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) return { ok: true };
    // Slack says why in the body (`invalid_token`, `channel_not_found`), and the status alone would
    // leave the Developer with a number to look up.
    const said = (await response.text().catch(() => "")).trim();
    return { ok: false, error: `${response.status} ${said}`.trim().slice(0, MAX_ERROR) };
  } catch (cause) {
    // A timeout, a DNS failure, a refused connection: the message is what there is to tell.
    return { ok: false, error: (cause instanceof Error ? cause.message : String(cause)).slice(0, MAX_ERROR) };
  }
};
