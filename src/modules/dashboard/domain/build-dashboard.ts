import {
  compareVersions,
  computeUpgradePath,
  type PathCounts,
  type PathRelease,
  parseVersion,
  type Significance,
  type SummaryStatus,
} from "@/modules/releases";
import type { Judged, SummaryContent } from "@/modules/summaries";
import { isoWeekKey, isoWeekOf } from "./iso-week";
import { type DashboardRow, type DigestWeek, sectionRows, weeklyDigest } from "./sections";

// The Version in use is declared, never observed, so it travels with the day it was declared: a
// count built on it is only readable next to that day (CONTEXT.md, Versione in uso).
export type CurrentVersion = { version: string; declaredAt: Date };

export type FollowedTechnology = { slug: string; name: string; currentVersion: CurrentVersion | null };

// How far a followed Technology is from its latest stable Release, counted from the Version in use
// with the rules of the Upgrade Path. Null when nothing is declared, and also when the declaration
// no longer places: a Technology with no stable Release has no distance to measure.
export type BehindStanding = CurrentVersion & { to: string; counts: PathCounts };

// `summary` is the content of a ready Summary, already validated; null while there is none. The
// verdict comes with it instead of being read off the content, because a ready Summary does not
// always carry one: see `Judged` (CONTEXT.md, Note giudicabili).
export type DashboardRelease = Judged & {
  slug: string;
  version: string;
  significance: Significance;
  publishedAt: Date;
  summaryStatus: SummaryStatus | null;
  summary: SummaryContent | null;
};

// Where a quiet Technology stands: its latest major, however old, or, when no major was ever
// recorded, simply its latest Release. The flag lets the row say which of the two it is showing
// instead of calling a minor Release a major.
export type SpotlightStanding = { release: DashboardRelease; major: boolean };

// A Technology with nothing featured in the window shows a compact row instead, because "no news"
// still has to say where the Technology stands.
export type SpotlightEntry = {
  technology: FollowedTechnology;
  featured: DashboardRelease[];
  standing: SpotlightStanding | null;
  behind: BehindStanding | null;
};

// The page verdict counts featured Releases, not Technologies: a Release without a ready Summary is
// neither, because calling it safe would be a promise the Summary has not made yet.
export type DashboardVerdict = { needsAction: number; safe: number };

// The counts line: the whole window, not just what Spotlight shows. `previews` keeps the plural the
// section uses, so the line and its destination say the same word.
export type DashboardCounts = {
  technologies: number;
  featured: number;
  notable: number;
  previews: number;
  digest: number;
};

// The declarations taken together, for the line that opens the page. `since` is the oldest of them,
// because a total is only as fresh as the stalest declaration under it. Null when nobody declared:
// a Developer who declares nothing reads the page exactly as before.
export type InUseTotals = { declared: number; behind: number; needsAction: number; since: Date };

// `thisWeek` is the ISO week of `now`: a row marks itself recent by comparing its own week with it,
// so "this week" means the same thing in every section of the page.
export type Dashboard = {
  verdict: DashboardVerdict;
  counts: DashboardCounts;
  inUse: InUseTotals | null;
  spotlight: SpotlightEntry[];
  latest: DashboardRow[];
  previews: DashboardRow[];
  digest: DigestWeek[];
  thisWeek: string;
};

// The Dashboard looks back 30 days, always from an injected `now` so the page is testable.
export const WINDOW_DAYS = 30;

function windowStart(now: Date): Date {
  return new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

function standingOf(releases: readonly DashboardRelease[]): SpotlightStanding | null {
  const parsed = releases.flatMap((release) => {
    const version = parseVersion(release.version);
    return version ? [{ release, version }] : [];
  });
  const isMajor = ({ version }: (typeof parsed)[number]) =>
    version.minor === 0 && version.patch === 0 && version.prerelease.length === 0;
  const newest = (candidates: typeof parsed) =>
    candidates.sort((a, b) => compareVersions(a.version, b.version)).at(-1) ?? null;

  // Where a Technology stands is a stable Release: a beta is newer by SemVer but nobody is on it.
  // A Technology that has only ever published Previews shows one anyway, which beats saying that
  // nothing was ever recorded.
  const stable = parsed.filter(({ version }) => version.prerelease.length === 0);
  const candidates = stable.length > 0 ? stable : parsed;

  const major = newest(candidates.filter(isMajor));
  if (major) return { release: major.release, major: true };
  const latest = newest(candidates);
  return latest ? { release: latest.release, major: false } : null;
}

// The Version in use measures the same distance the Technology page measures, with the same
// function: Releases without a ready Summary count as neither safe nor action required, and the
// Digests stay out of the action count (CONTEXT.md, Cammino di upgrade).
function toPathRelease(release: DashboardRelease): PathRelease {
  return {
    version: release.version,
    significance: release.significance,
    publishedAt: release.publishedAt,
    actionRequired: release.actionRequired,
    unjudged: release.unjudged,
  };
}

function behindOf(declared: CurrentVersion | null, mine: readonly DashboardRelease[]): BehindStanding | null {
  if (!declared) return null;
  const path = computeUpgradePath(mine.map(toPathRelease), declared.version);
  return path.type === "path" ? { ...declared, to: path.to, counts: path.counts } : null;
}

function inUseTotals(spotlight: readonly SpotlightEntry[]): InUseTotals | null {
  const standings = spotlight.flatMap((entry) => (entry.behind ? [entry.behind] : []));
  if (standings.length === 0) return null;
  const sum = (of: (standing: BehindStanding) => number) => standings.reduce((total, standing) => total + of(standing), 0);
  return {
    declared: standings.length,
    behind: sum(({ counts }) => counts.total),
    needsAction: sum(({ counts }) => counts.actionRequired),
    since: new Date(Math.min(...standings.map(({ declaredAt }) => declaredAt.getTime()))),
  };
}

function needsAction(entry: SpotlightEntry): boolean {
  return entry.featured.some((release) => release.actionRequired === true);
}

// What the eye should meet first: the Technologies asking for work, then the ones with news that
// costs nothing, then the quiet ones. Inside each group the most recent comes first.
function rank(entry: SpotlightEntry): number {
  if (needsAction(entry)) return 0;
  return entry.featured.length > 0 ? 1 : 2;
}

function shownAt(entry: SpotlightEntry): number {
  const dates = [...entry.featured, ...(entry.standing ? [entry.standing.release] : [])];
  return Math.max(0, ...dates.map((release) => release.publishedAt.getTime()));
}

function byUrgencyThenDate(a: SpotlightEntry, b: SpotlightEntry): number {
  return rank(a) - rank(b) || shownAt(b) - shownAt(a);
}

function verdictOf(spotlight: readonly SpotlightEntry[]): DashboardVerdict {
  const featured = spotlight.flatMap((entry) => entry.featured);
  return {
    needsAction: featured.filter((release) => release.actionRequired === true).length,
    safe: featured.filter((release) => release.actionRequired === false).length,
  };
}

function countsOf(followed: readonly FollowedTechnology[], recent: readonly DashboardRow[]): DashboardCounts {
  const of = (significance: Significance) => recent.filter(({ release }) => release.significance === significance).length;
  return {
    technologies: followed.length,
    featured: of("featured"),
    notable: of("notable"),
    previews: of("preview"),
    digest: of("digest"),
  };
}

export function buildDashboard(
  followed: readonly FollowedTechnology[],
  releases: readonly DashboardRelease[],
  now: Date,
): Dashboard {
  const start = windowStart(now);
  const bySlug = new Map(followed.map((technology) => [technology.slug, technology]));
  const recent = releases.flatMap((release) => {
    const technology = bySlug.get(release.slug);
    return technology && release.publishedAt >= start ? [{ technology, release }] : [];
  });

  const spotlight = followed
    .map((technology) => {
      const mine = releases.filter((release) => release.slug === technology.slug);
      const featured = mine
        .filter((release) => release.significance === "featured" && release.publishedAt >= start)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      return {
        technology,
        featured,
        standing: featured.length > 0 ? null : standingOf(mine),
        behind: behindOf(technology.currentVersion, mine),
      };
    })
    .sort(byUrgencyThenDate);

  return {
    verdict: verdictOf(spotlight),
    counts: countsOf(followed, recent),
    inUse: inUseTotals(spotlight),
    spotlight,
    latest: sectionRows(recent, "notable"),
    previews: sectionRows(recent, "preview"),
    digest: weeklyDigest(recent),
    thisWeek: isoWeekKey(isoWeekOf(now)),
  };
}
