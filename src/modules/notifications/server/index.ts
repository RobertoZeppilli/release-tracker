import "server-only";

export { generateNotifications, type GenerateReport } from "./generate-notifications";
export { pruneNotifications, RETENTION_DAYS } from "./prune-notifications";
// ⚠️ The Server Actions are **not** re-exported here: this index is `server-only`, and the client
// component that holds a switch imports `./save-notification-settings` directly, which is a file of
// the same module and so not the cross-module import ADR 0006 routes through an index.
export { type NotificationSettings, readNotificationSettings } from "./read-notification-settings";
export { writePreference, writePreferredLocale } from "./write-notification-settings";
