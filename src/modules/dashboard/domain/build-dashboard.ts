import type {
  DashboardRelease,
  DashboardRow,
  FollowedTechnology,
} from "./followed";
import { isoWeekKey, isoWeekOf } from "./iso-week";
import { buildStanding, type Standing } from "./standing";
import { buildStream, type Stream } from "./stream";

// GLOSSARY.md, Verdetto della Dashboard: the verdict counts Releases, not Technologies, and it is
// the sum of the Standing's rows by construction, the same count made once per row and once at the
// head. Null when nothing in the set can be judged: an empty set authorizes no reassurance.
export type DashboardVerdict = { needsAction: number; safe: number };

// The two parts that answer the two questions, and nothing is printed in both (DESIGN.md, The Two
// Questions Rule). The window is carried so the page can name it where it names its size.
export type Dashboard = {
  verdict: DashboardVerdict | null;
  standing: Standing;
  stream: Stream;
  window: { start: Date; end: Date };
};

// The Dashboard looks back 30 days, always from an injected `now` so the page is testable.
export const WINDOW_DAYS = 30;

function windowStart(now: Date): Date {
  return new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

function verdictOf(standing: Standing): DashboardVerdict | null {
  const sum = (of: (row: Standing["rows"][number]) => number) =>
    standing.rows.reduce((total, row) => total + of(row), 0);
  const needsAction = sum((row) => row.needsAction);
  const safe = sum((row) => row.safe);
  return needsAction + safe === 0 ? null : { needsAction, safe };
}

export function buildDashboard(
  followed: readonly FollowedTechnology[],
  releases: readonly DashboardRelease[],
  now: Date,
): Dashboard {
  const start = windowStart(now);
  const bySlug = new Map(
    followed.map((technology) => [technology.slug, technology]),
  );
  const rows: DashboardRow[] = releases.flatMap((release) => {
    const technology = bySlug.get(release.slug);
    return technology && release.publishedAt >= start
      ? [{ technology, release }]
      : [];
  });

  const standing = buildStanding(followed, releases, start);

  return {
    verdict: verdictOf(standing),
    standing,
    stream: buildStream(rows, isoWeekKey(isoWeekOf(now))),
    window: { start, end: now },
  };
}
