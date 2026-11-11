import type { Locale } from "@/modules/i18n";
import type { ReleaseEvent } from "./events";
import { isEnabled, type Preference } from "./preferences";
import type { SlackLine } from "./slack";

// A Notification that has no Slack delivery yet, with everything its line needs. The URL is built by
// the job, because a webhook has no page it was opened from: the link has to be absolute.
export type PendingSlack = {
  notificationId: string;
  userId: string;
  event: ReleaseEvent;
  technologyName: string;
  // The Technology's slug, which is what its Release page is addressed by: the name is what the line
  // prints, and the two are not the same word.
  slug: string;
  version: string;
  url: string;
};

// A Developer the job may send to, as the job read them. `webhookUrl` is the secret, which is why
// this type never crosses to the client.
export type SlackRecipient = {
  userId: string;
  webhookUrl: string;
  locale: Locale;
  preferences: readonly Preference[];
};

// One send: one message, the Notifications it accounts for, and where it goes. The ids are what the
// job writes deliveries for afterwards, so a Notification is never sent twice.
export type SlackSend = {
  userId: string;
  webhookUrl: string;
  locale: Locale;
  notificationIds: readonly string[];
  lines: readonly SlackLine[];
};

// Who gets what, in one message each. Pure, so the rule can be read without a database: the job
// around it does the sending and the writing, and nothing else decides who hears about what.
//
// `externalChannelOpen` stood at the top of this loop until issue #209: the external channels were
// Pro, with a 30 day trial that shut them when it ran out (ADR 0009, superseded by 0011). There is
// one level of service now, so a Developer with a webhook and a preference is a recipient.
export function planSlackSends(
  pending: readonly PendingSlack[],
  recipients: readonly SlackRecipient[],
): SlackSend[] {
  const byUser = new Map(recipients.map((recipient) => [recipient.userId, recipient]));

  const sends = new Map<string, SlackSend>();
  for (const one of pending) {
    const recipient = byUser.get(one.userId);
    if (!recipient) continue;
    // Per event and per channel, which is what the table of #169 is for: a Developer who wants
    // `featured` on Slack and `notable` only on the bell gets the one and not the other.
    if (!isEnabled(recipient.preferences, one.event, "slack")) continue;
    const started = sends.get(one.userId) ?? {
      userId: recipient.userId,
      webhookUrl: recipient.webhookUrl,
      locale: recipient.locale,
      notificationIds: [],
      lines: [],
    };
    sends.set(one.userId, {
      ...started,
      notificationIds: [...started.notificationIds, one.notificationId],
      lines: [...started.lines, { event: one.event, technologyName: one.technologyName, version: one.version, url: one.url }],
    });
  }
  return [...sends.values()];
}
