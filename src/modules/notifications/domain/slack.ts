import type { Translator } from "@/modules/i18n";
import type { ReleaseEvent } from "./events";

// The only host a webhook may point at. Anything else is this Developer's secret posted to somebody
// else's server, so the check is here, in the Server Action and in the database (#172).
export const SLACK_WEBHOOK_PREFIX = "https://hooks.slack.com/services/";

export function isSlackWebhook(url: string): boolean {
  return url.startsWith(SLACK_WEBHOOK_PREFIX) && url.length > SLACK_WEBHOOK_PREFIX.length;
}

// What a Developer reads back instead of the URL, since the URL never leaves the server again: the
// host, which says where it goes, and the last four characters, which say **which** webhook it is
// when a Slack workspace holds several. Four and not more: the tail of the path is the secret.
export function webhookHint(url: string): string {
  return `hooks.slack.com/…${url.slice(-4)}`;
}

// One line of the message: the Technology, the Version and where to read the rest. The event is kept
// rather than a word, because `featured` and `notable` are the product's grammar and stay in English
// in all five languages (ADR 0008).
export type SlackLine = {
  event: ReleaseEvent;
  technologyName: string;
  version: string;
  url: string;
};

// ⚠️ One message per run and per Developer, not one per Release (`docs/DECISIONI.md`): a webhook
// holds about one message a second, and ten Releases in a run would be ten sends in a row.
// Twenty lines is where the message stops and starts counting instead: Slack truncates a long
// message, and a truncated list is worse than a list that says how much it left out.
export const MAX_LINES = 20;

export function slackMessage(t: Translator, lines: readonly SlackLine[]): string {
  const shown = lines.slice(0, MAX_LINES);
  const rest = lines.length - shown.length;
  const body = shown.map((line) => `${line.event === "featured_release" ? "featured" : "notable"} · ${line.technologyName} ${line.version} · ${line.url}`);
  const head = t("notification.slack.heading", { count: lines.length });
  const tail = rest > 0 ? [t("notification.slack.more", { count: rest })] : [];
  return [head, ...body, ...tail].join("\n");
}
