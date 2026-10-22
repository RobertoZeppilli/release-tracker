import type { NotificationChannel, NotificationEvent } from "./events";

export type Preference = { event: NotificationEvent; channel: NotificationChannel; enabled: boolean };

// The declared starting point, which is what a missing row means: the bell is on, because it costs
// nothing and is free for good (ADR 0009), and the external channels stay off until a Developer
// switches one on, because switching one on is what starts their 30 day trial.
export function enabledByDefault(channel: NotificationChannel): boolean {
  return channel === "in_app";
}

export const CHANNELS = ["in_app", "slack", "email"] as const satisfies readonly NotificationChannel[];

export function isEnabled(preferences: readonly Preference[], event: NotificationEvent, channel: NotificationChannel): boolean {
  const stored = preferences.find((preference) => preference.event === event && preference.channel === channel);
  return stored?.enabled ?? enabledByDefault(channel);
}

// A Notification is one row that every channel then reads, so it is worth writing when the Developer
// wants that event anywhere: with the bell off and the email on, the email still has to be sent.
export function wantsEvent(preferences: readonly Preference[], event: NotificationEvent): boolean {
  return CHANNELS.some((channel) => isEnabled(preferences, event, channel));
}
