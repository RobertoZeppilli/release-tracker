export {
  isSummarySettled,
  type NotificationChannel,
  NotificationChannelSchema,
  type NotificationEvent,
  NotificationEventSchema,
  type ReleaseEvent,
  releaseEventFor,
} from "./domain/events";
export {
  type Follower,
  type PlannedNotification,
  planReleaseNotifications,
  type ReleaseCandidate,
} from "./domain/plan";
export {
  canSwitch,
  CHANNELS,
  enabledByDefault,
  EXTERNAL_CHANNELS,
  isEnabled,
  isExternal,
  LIVE_CHANNELS,
  LIVE_EVENTS,
  type Preference,
  wantsEvent,
} from "./domain/preferences";
export { EXTERNAL_TRIAL_DAYS, type Trial, trialOf } from "./domain/trial";
