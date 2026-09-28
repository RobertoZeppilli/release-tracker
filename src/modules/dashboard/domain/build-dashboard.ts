import { compareVersions, type Significance, parseVersion, type SummaryStatus } from "@/modules/releases";
import type { SummaryContent } from "@/modules/summaries";

export type FollowedTechnology = { slug: string; name: string };

// `summary` is the content of a ready Summary, already validated; null while there is none.
export type DashboardRelease = {
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

export type Dashboard = { verdict: DashboardVerdict; counts: DashboardCounts; spotlight: SpotlightEntry[] };

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

  const major = newest(parsed.filter(isMajor));
  if (major) return { release: major.release, major: true };
  const latest = newest(parsed);
  return latest ? { release: latest.release, major: false } : null;
}

function needsAction(entry: SpotlightEntry): boolean {
  return entry.featured.some((release) => release.summary?.actionRequired === true);
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
    needsAction: featured.filter((release) => release.summary?.actionRequired === true).length,
    safe: featured.filter((release) => release.summary?.actionRequired === false).length,
  };
}

function countsOf(
  followed: readonly FollowedTechnology[],
  recent: readonly DashboardRelease[],
): DashboardCounts {
  const of = (significance: Significance) => recent.filter((release) => release.significance === significance).length;
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
  const slugs = new Set(followed.map((technology) => technology.slug));
  const recent = releases.filter((release) => release.publishedAt >= start && slugs.has(release.slug));

  const spotlight = followed
    .map((technology) => {
      const mine = releases.filter((release) => release.slug === technology.slug);
      const featured = mine
        .filter((release) => release.significance === "featured" && release.publishedAt >= start)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      return { technology, featured, standing: featured.length > 0 ? null : standingOf(mine) };
    })
    .sort(byUrgencyThenDate);

  return { verdict: verdictOf(spotlight), counts: countsOf(followed, recent), spotlight };
}
