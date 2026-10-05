import type { SummaryContent } from "@/modules/summaries";
import { foldDigests, type ListedRelease, type MajorRow } from "./group-by-major";
import type { SummaryStatus } from "./initial-summary-status";
import { compareVersions, parseVersion, sortByVersion, splitByMajor } from "./version";

// `actionRequired` is null while the Release has no ready Summary, and also when it has one whose
// Release Notes could not be judged (CONTEXT.md, Note giudicabili): `unjudged` tells the two apart,
// because only one of them can say there is a Summary to read.
export type PathRelease = ListedRelease & { actionRequired: boolean | null; unjudged: boolean };

// What the Technology page reads: the path needs the verdict, and each row says what the Summary
// says, so `summary` carries the whole content of a ready one and is null while there is none.
export type SummarizedRelease = PathRelease & { summaryStatus: SummaryStatus | null; summary: SummaryContent | null };

export type PathCounts = {
  total: number;
  featured: number;
  notable: number;
  digest: number;
  actionRequired: number;
  safe: number;
  // Featured and notable Releases without a ready Summary: neither safe nor action required.
  missing: number;
  // Of which have a ready Summary whose notes could not be judged. A subset of `missing`, so the
  // three verdict counts still add up to the summarized Releases.
  unjudged: number;
};

export type PathMajor<T> = { major: number; counts: PathCounts; rows: MajorRow<T>[] };

export type InvalidFrom = "malformed" | "notOlder" | "noStable";

export type UpgradePath<T> =
  | { type: "invalid"; from: string; reason: InvalidFrom; latest: string | null }
  | {
      type: "path";
      from: string;
      to: string;
      recorded: boolean;
      // For a `from` that is not recorded: the recorded stable Versions just before and after it.
      suggestions: string[];
      counts: PathCounts;
      majors: PathMajor<T>[];
      previews: T[];
    };

// CONTEXT.md, Cammino di upgrade: a `from` missing from the recorded Releases still gets a path,
// because the recorded history covers only the last 12 months.
export function computeUpgradePath<T extends PathRelease>(releases: readonly T[], typed: string): UpgradePath<T> {
  const written = typed.trim();
  const from = written.replace(/^v(?=\d)/, "");
  const start = parseVersion(from);
  const sorted = sortByVersion(releases);
  const stable = sorted.filter(({ version }) => version.prerelease.length === 0);
  const latest = stable.at(-1);

  if (!latest) return { type: "invalid", from: written, reason: "noStable", latest: null };
  const invalid = (reason: InvalidFrom) => ({ type: "invalid" as const, from: written, reason, latest: latest.release.version });
  if (!start) return invalid("malformed");
  if (compareVersions(start, latest.version) > 0) return invalid("notOlder");

  const range = stable.filter(({ version }) => compareVersions(version, start) > 0);
  const recorded = sorted.some(({ version }) => compareVersions(version, start) === 0);
  const before = stable.filter(({ version }) => compareVersions(version, start) < 0).at(-1);

  return {
    type: "path",
    from,
    to: latest.release.version,
    recorded,
    suggestions: recorded ? [] : [before, range[0]].flatMap((entry) => (entry ? [entry.release.version] : [])),
    counts: countPath(range.map(({ release }) => release)),
    majors: [...splitByMajor(range).entries()].map(([major, members]) => ({
      major,
      counts: countPath(members),
      rows: foldDigests(members),
    })),
    previews: sorted.filter(({ version }) => compareVersions(version, latest.version) > 0).map(({ release }) => release),
  };
}

// The Version in use is validated exactly as the start of an Upgrade Path (CONTEXT.md), so the two
// can never drift apart: same releases, same function, only the reason is kept.
export function upgradeStartRejection(releases: readonly PathRelease[], typed: string): InvalidFrom | null {
  const path = computeUpgradePath(releases, typed);
  return path.type === "invalid" ? path.reason : null;
}

function countPath(releases: readonly PathRelease[]): PathCounts {
  const summarized = releases.filter(({ significance }) => significance !== "digest");
  const count = (keep: (release: PathRelease) => boolean) => summarized.filter(keep).length;
  return {
    total: releases.length,
    featured: count(({ significance }) => significance === "featured"),
    notable: count(({ significance }) => significance === "notable"),
    digest: releases.length - summarized.length,
    actionRequired: count(({ actionRequired }) => actionRequired === true),
    safe: count(({ actionRequired }) => actionRequired === false),
    missing: count(({ actionRequired }) => actionRequired === null),
    unjudged: count(({ unjudged }) => unjudged),
  };
}
