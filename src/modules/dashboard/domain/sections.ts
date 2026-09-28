import { compareVersions, parseVersion, type Significance } from "@/modules/releases";
import type { DashboardRelease, FollowedTechnology } from "./build-dashboard";
import { type IsoWeek, isoWeekKey, isoWeekOf, isoWeekRange } from "./iso-week";

// A row of Latest, Previews or the Weekly Digest: the Release plus the Technology it belongs to,
// because these sections mix Technologies and every line has to name its own.
export type DashboardRow = { technology: FollowedTechnology; release: DashboardRelease };

// One ISO week of the Weekly Digest, computed at read time and never stored.
export type DigestWeek = { key: string; week: IsoWeek; start: Date; end: Date; rows: DashboardRow[] };

// Newest first. Two Releases of the same day are ordered by Version, so the line of a Technology
// that ships twice a day does not change order between two visits.
function byDateThenVersion(a: DashboardRow, b: DashboardRow): number {
  const byDate = b.release.publishedAt.getTime() - a.release.publishedAt.getTime();
  if (byDate !== 0) return byDate;
  const left = parseVersion(a.release.version);
  const right = parseVersion(b.release.version);
  if (left && right) return compareVersions(right, left);
  return b.release.version.localeCompare(a.release.version);
}

export function sectionRows(rows: readonly DashboardRow[], significance: Significance): DashboardRow[] {
  return rows.filter(({ release }) => release.significance === significance).sort(byDateThenVersion);
}

export function weeklyDigest(rows: readonly DashboardRow[]): DigestWeek[] {
  const weeks = new Map<string, DigestWeek>();

  for (const row of sectionRows(rows, "digest")) {
    const week = isoWeekOf(row.release.publishedAt);
    const key = isoWeekKey(week);
    const found = weeks.get(key);
    if (found) {
      found.rows.push(row);
      continue;
    }
    weeks.set(key, { key, week, ...isoWeekRange(week), rows: [row] });
  }

  return [...weeks.values()].sort((a, b) => b.start.getTime() - a.start.getTime());
}
