import { compareVersions, parseVersion } from "@/modules/releases";
import type { DashboardRow } from "./followed";
import { type IsoWeek, isoWeekKey, isoWeekOf, isoWeekRange } from "./iso-week";

// One day of the Flusso: the Releases published on it, newest first (GLOSSARY.md, Flusso).
export type StreamDay = {
  date: string;
  thisWeek: boolean;
  rows: DashboardRow[];
};

// One ISO week of the Weekly Digest, computed at read time and never stored.
export type DigestWeek = {
  key: string;
  week: IsoWeek;
  start: Date;
  end: Date;
  rows: DashboardRow[];
};

// The Stream counts every Release of its window, the folded ones included: the title says how big
// the window is, and the quiet end says again how much of it is folded in.
export type Stream = { days: StreamDay[]; digest: DigestWeek[]; total: number };

function utcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Newest first. Two Releases of the same day are ordered by Version, so the line of a Technology
// that ships twice a day does not change order between two visits.
function byDateThenVersion(a: DashboardRow, b: DashboardRow): number {
  const byDate =
    b.release.publishedAt.getTime() - a.release.publishedAt.getTime();
  if (byDate !== 0) return byDate;
  const left = parseVersion(a.release.version);
  const right = parseVersion(b.release.version);
  if (left && right) return compareVersions(right, left);
  return b.release.version.localeCompare(a.release.version);
}

function isDigest({ release }: DashboardRow): boolean {
  return release.significance === "digest";
}

function streamDays(
  rows: readonly DashboardRow[],
  thisWeek: string,
): StreamDay[] {
  const days = new Map<string, StreamDay>();

  for (const row of [...rows].sort(byDateThenVersion)) {
    const date = utcDate(row.release.publishedAt);
    const found = days.get(date);
    if (found) {
      found.rows.push(row);
      continue;
    }
    days.set(date, {
      date,
      thisWeek: isoWeekKey(isoWeekOf(row.release.publishedAt)) === thisWeek,
      rows: [row],
    });
  }

  return [...days.values()];
}

function weeklyDigest(rows: readonly DashboardRow[]): DigestWeek[] {
  const weeks = new Map<string, DigestWeek>();

  for (const row of [...rows].sort(byDateThenVersion)) {
    const week = isoWeekOf(row.release.publishedAt);
    const key = isoWeekKey(week);
    const found = weeks.get(key);
    if (found) {
      found.rows.push(row);
      continue;
    }
    weeks.set(key, { key, week, ...isoWeekRange(week), rows: [row] });
  }

  return [...weeks.values()].sort(
    (a, b) => b.start.getTime() - a.start.getTime(),
  );
}

// The Stream is one stream in date order with no divisions by Significance, and the Digests are the
// one thing that leaves it: they fold per ISO week at its quiet end (GLOSSARY.md, Digest settimanale).
export function buildStream(
  rows: readonly DashboardRow[],
  thisWeek: string,
): Stream {
  return {
    days: streamDays(
      rows.filter((row) => !isDigest(row)),
      thisWeek,
    ),
    digest: weeklyDigest(rows.filter(isDigest)),
    total: rows.length,
  };
}
