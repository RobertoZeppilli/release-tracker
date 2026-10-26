import type { Locale } from "@/modules/i18n";
import type { ReleaseEvent } from "./events";
import { isEnabled, type Preference } from "./preferences";
import type { SlackLine } from "./slack";
import { type Trial, trialOf } from "./trial";

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
  pro: boolean;
  trialStartedAt: Date | null;
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

// ⚠️ The external channels are Pro, with a 30 day trial that starts at the first switch (ADR 0009):
// when the trial has ended and no Plan was bought, they go off **for everyone**, no acquired rights.
// `not-started` is open on purpose: it is the instant between the switch and the row that records
// when it was flipped, and refusing there would drop the first run after a Developer switches on.
export function externalChannelOpen(pro: boolean, trial: Trial): boolean {
  return pro || trial.kind !== "ended";
}

// Who gets what, in one message each. Pure, so the rule can be read without a database: the job
// around it does the sending and the writing, and nothing else decides who hears about what.
export function planSlackSends(
  pending: readonly PendingSlack[],
  recipients: readonly SlackRecipient[],
  now: Date,
): SlackSend[] {
  const byUser = new Map<string, SlackRecipient>();
  for (const recipient of recipients) {
    if (!externalChannelOpen(recipient.pro, trialOf(recipient.trialStartedAt, now))) continue;
    byUser.set(recipient.userId, recipient);
  }

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
