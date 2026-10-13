import { computeUpgradePath, latestStableVersion } from "@/modules/releases";
import type { DashboardRelease, FollowedTechnology } from "./followed";

// One row of the Posizione dello stack: a followed Technology, accounted for exactly once
// (CONTEXT.md, Posizione dello stack). `latest` is the latest stable Release, the version the row
// prints on the right; `declared` is the Version in use its words name.
export type StandingRow = {
  technology: FollowedTechnology;
  latest: string | null;
  declared: string | null;
  // Null where there is no Distance to show: without a declaration, and where the declaration no
  // longer places (CONTEXT.md, Distanza). Zero is a Distance, and the row reads `up to date`.
  distance: number | null;
  // The Releases of this Technology the page is accountable for, counted by their verdict. The sum
  // of `needsAction` over the rows is the page verdict, by construction and not by coincidence.
  needsAction: number;
  safe: number;
  missing: number;
};

export type Standing = {
  rows: StandingRow[];
  // The Distance of the longest row, what every bar is a share of. Null when no bar is drawn: with
  // fewer than two rows carrying a Distance the lane goes rather than lies (DESIGN.md).
  scale: number | null;
  behind: number;
  missing: number;
  // The oldest declaration under the counts, because a total is only as fresh as the stalest thing
  // under it. Null when nobody declared, and then there is no total to print either.
  since: Date | null;
};

const MIN_BARS = 2;

// The set the page is accountable for, per Technology: its Releases in the Stream's window whatever
// their Significance, plus the ones its Upgrade Path leaves ahead, each Release counted once
// (CONTEXT.md, Verdetto della Dashboard).
function accountable(
  inWindow: readonly DashboardRelease[],
  ahead: readonly DashboardRelease[],
): DashboardRelease[] {
  const seen = new Map<string, DashboardRelease>();
  for (const release of [...inWindow, ...ahead])
    seen.set(release.version, release);
  return [...seen.values()];
}

// Digests carry no verdict and never count, here as everywhere a verdict is counted, and neither
// does a Release whose notes could not be judged: `actionRequired` is already null for both.
function countVerdicts(releases: readonly DashboardRelease[]) {
  const judged = releases.filter(
    ({ significance }) => significance !== "digest",
  );
  const count = (keep: (release: DashboardRelease) => boolean) =>
    judged.filter(keep).length;
  return {
    needsAction: count(({ actionRequired }) => actionRequired === true),
    safe: count(({ actionRequired }) => actionRequired === false),
    missing: count(({ actionRequired }) => actionRequired === null),
  };
}

function standingRow(
  technology: FollowedTechnology,
  mine: readonly DashboardRelease[],
  inWindow: readonly DashboardRelease[],
): StandingRow {
  const declared = technology.currentVersion;
  const path = declared ? computeUpgradePath(mine, declared.version) : null;
  const placed = path?.type === "path" ? path : null;

  return {
    technology,
    latest: latestStableVersion(mine.map(({ version }) => version)),
    declared: placed ? (declared?.version ?? null) : null,
    distance: placed ? placed.counts.total : null,
    ...countVerdicts(accountable(inWindow, placed?.range ?? [])),
  };
}

// CONTEXT.md, Distanza: first the Technologies asking for work, by number; then the ones with a
// Distance, largest first; then the ones with no declaration; last the ones in step. Inside a group
// the name orders, so two visits read the same.
function rank(row: StandingRow): number {
  if (row.needsAction > 0) return 0;
  if (row.distance === null) return 2;
  return row.distance > 0 ? 1 : 3;
}

function byRankThenDistance(a: StandingRow, b: StandingRow): number {
  return (
    rank(a) - rank(b) ||
    b.needsAction - a.needsAction ||
    (b.distance ?? 0) - (a.distance ?? 0) ||
    a.technology.name.localeCompare(b.technology.name)
  );
}

export function buildStanding(
  followed: readonly FollowedTechnology[],
  releases: readonly DashboardRelease[],
  windowStart: Date,
): Standing {
  const rows = followed
    .map((technology) => {
      const mine = releases.filter(
        (release) => release.slug === technology.slug,
      );
      return standingRow(
        technology,
        mine,
        mine.filter((release) => release.publishedAt >= windowStart),
      );
    })
    .sort(byRankThenDistance);

  const distances = rows.flatMap((row) =>
    row.distance === null ? [] : [row.distance],
  );
  const declarations = rows.flatMap((row) =>
    row.declared && row.technology.currentVersion
      ? [row.technology.currentVersion.declaredAt]
      : [],
  );
  const sum = (of: (row: StandingRow) => number) =>
    rows.reduce((total, row) => total + of(row), 0);

  return {
    rows,
    scale: distances.length >= MIN_BARS ? Math.max(...distances) : null,
    behind: distances.reduce((total, distance) => total + distance, 0),
    missing: sum((row) => row.missing),
    since:
      declarations.length > 0
        ? new Date(Math.min(...declarations.map((date) => date.getTime())))
        : null,
  };
}
