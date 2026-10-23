import type { NotificationChannel, NotificationEvent } from "./events";

export type Preference = { event: NotificationEvent; channel: NotificationChannel; enabled: boolean };

// The declared starting point, which is what a missing row means: the bell is on, because it costs
// nothing and is free for good (ADR 0009), and the external channels stay off until a Developer
// switches one on, because switching one on is what starts their 30 day trial.
export function enabledByDefault(channel: NotificationChannel): boolean {
  return !isExternal(channel);
}

export const CHANNELS = ["in_app", "slack", "email"] as const satisfies readonly NotificationChannel[];

// The two channels the 30 day trial is about, and the two that are Pro (ADR 0009): the bell has no
// marginal cost per reader, a webhook call and a piece of mail have one.
export const EXTERNAL_CHANNELS = ["slack", "email"] as const satisfies readonly NotificationChannel[];

export function isExternal(channel: NotificationChannel): boolean {
  return channel !== "in_app";
}

// What a Developer can actually switch today. The table is per event and per channel from the first
// day (ADR 0009), so #172 and #173 each light their own column instead of inventing a table; but a
// switch for a channel that sends nothing would be a promise, and the weekly Digest has no line to
// be printed on until #173 (see `notifications-store`, SHOWN). `/settings` draws only these, and the
// Server Action refuses anything else: a form can be posted without the page.
export const LIVE_CHANNELS = ["in_app"] as const satisfies readonly NotificationChannel[];
export const LIVE_EVENTS = [
  "featured_release",
  "notable_release",
] as const satisfies readonly NotificationEvent[];

export function canSwitch(event: NotificationEvent, channel: NotificationChannel): boolean {
  return LIVE_EVENTS.some((live) => live === event) && LIVE_CHANNELS.some((live) => live === channel);
}

export function isEnabled(preferences: readonly Preference[], event: NotificationEvent, channel: NotificationChannel): boolean {
  const stored = preferences.find((preference) => preference.event === event && preference.channel === channel);
  return stored?.enabled ?? enabledByDefault(channel);
}

// A Notification is one row that every channel then reads, so it is worth writing when the Developer
// wants that event anywhere: with the bell off and the email on, the email still has to be sent.
export function wantsEvent(preferences: readonly Preference[], event: NotificationEvent): boolean {
  return CHANNELS.some((channel) => isEnabled(preferences, event, channel));
}
