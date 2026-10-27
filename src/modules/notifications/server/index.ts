import "server-only";

export { deliverSlack, type DeliverOptions, type DeliverReport } from "./deliver-slack";
export { generateNotifications, type GenerateReport } from "./generate-notifications";
export { pruneNotifications, RETENTION_DAYS } from "./prune-notifications";
// ⚠️ The Server Actions are **not** re-exported here: this index is `server-only`, and the client
// component that holds a switch imports `./save-notification-settings` directly, which is a file of
// the same module and so not the cross-module import ADR 0006 routes through an index.
export { type NotificationSettings, readNotificationSettings } from "./read-notification-settings";
export { type SendResult, sendToSlack, type SendToSlack } from "./send-slack";
export {
  exchangeSlackCode,
  type ExchangeResult,
  isSlackOauthEnabled,
  slackOauthCredentials,
  slackRedirectUri,
  slackStateSigner,
} from "./slack-oauth";
export {
  startExternalTrial,
  writePreference,
  writePreferredLocale,
  writeSlackWebhook,
} from "./write-notification-settings";
