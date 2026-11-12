import type { Locale } from "@/modules/i18n";
import type { ReleaseEvent } from "./events";
import { isEnabled, type Preference } from "./preferences";
import type { SlackLine } from "./slack";

// A Notification that has no Slack delivery yet, with everything its line needs. The URL is built by
// the job, because a webhook has no page it was opened from: the link has to be absolute.
export type PendingSlack = {
  notificationId: string;
  event: ReleaseEvent;
  technologyName: string;
  // The Technology's slug, which is what its Release page is addressed by: the name is what the line
  // prints, and the two are not the same word.
  slug: string;
  version: string;
  url: string;
};

// The channel the job may send to, as the job read it. `webhookUrl` is the secret, which is why this
// type never crosses to the client.
export type SlackRecipient = {
  webhookUrl: string;
  locale: Locale;
  preferences: readonly Preference[];
};

// One send: one message, the Notifications it accounts for, and where it goes. The ids are what the
// job writes deliveries for afterwards, so a Notification is never sent twice.
export type SlackSend = {
  webhookUrl: string;
  locale: Locale;
  notificationIds: readonly string[];
  lines: readonly SlackLine[];
};

// What goes out, in one message (`docs/DECISIONI.md`). Pure, so the rule can be read without a
// database: the job around it does the sending and the writing, and nothing else decides what is
// worth sending.
//
// `externalChannelOpen` stood at the top of this loop until issue #209: the external channels were
// Pro, with a 30 day trial that shut them when it ran out (ADR 0009, superseded by 0011). There is
// one level of service now, so a webhook and a preference are the whole question.
//
// ⚠️ It planned a send **per Developer** until issue #210. One installed copy is one person, so the
// grouping had one group in it and what is left is whether to send at all: `null` is no webhook
// saved, or nothing this reader asked to hear about on Slack.
export function planSlackSend(
  pending: readonly PendingSlack[],
  recipient: SlackRecipient | null,
): SlackSend | null {
  if (!recipient) return null;

  // Per event and per channel, which is what the table of #169 is for: `featured` on Slack and
  // `notable` only on the bell is a pair of switches, not a channel that is on or off.
  const wanted = pending.filter((one) => isEnabled(recipient.preferences, one.event, "slack"));
  if (wanted.length === 0) return null;

  return {
    webhookUrl: recipient.webhookUrl,
    locale: recipient.locale,
    notificationIds: wanted.map((one) => one.notificationId),
    lines: wanted.map((one) => ({
      event: one.event,
      technologyName: one.technologyName,
      version: one.version,
      url: one.url,
    })),
  };
}
