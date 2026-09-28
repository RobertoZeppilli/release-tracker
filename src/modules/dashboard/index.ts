export {
  buildDashboard,
  type Dashboard,
  type DashboardCounts,
  type DashboardRelease,
  type DashboardVerdict,
  type FollowedTechnology,
  type SpotlightEntry,
  type SpotlightStanding,
  WINDOW_DAYS,
} from "./domain/build-dashboard";
export { type DashboardRow, type DigestWeek } from "./domain/sections";
export { type IsoWeek, isoWeekKey, isoWeekOf } from "./domain/iso-week";
