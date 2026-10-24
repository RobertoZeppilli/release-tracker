import type { SummaryContent } from "@/modules/summaries";
import { foldDigests, type ListedRelease, type MajorRow } from "./group-by-major";
import type { SummaryStatus } from "./initial-summary-status";
import { compareVersions, parseVersion, sortByVersion, splitByMajor } from "./version";

// `actionRequired` is null while the Release has no ready Summary, and also when it has one whose
// Release Notes could not be judged (GLOSSARY.md, Note giudicabili): `unjudged` tells the two apart,
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
      // The stable Releases the path covers, newest last. `counts` is derived from exactly these, so
      // a caller that has to reason about the Releases themselves never restates the selection rule.
      range: T[];
      majors: PathMajor<T>[];
      previews: T[];
    };

// GLOSSARY.md, Cammino di upgrade: a `from` missing from the recorded Releases still gets a path,
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
    range: range.map(({ release }) => release),
    majors: [...splitByMajor(range).entries()].map(([major, members]) => ({
      major,
      counts: countPath(members),
      rows: foldDigests(members),
    })),
    previews: sorted.filter(({ version }) => compareVersions(version, latest.version) > 0).map(({ release }) => release),
  };
}

export type RecordedHistory<T> = {
  // The Releases the plain list prints: the stable ones plus the Previews ahead of the latest. The
  // link that leads into this view counts these, so what it promises is what the page below lists.
  listed: number;
  stable: number;
  previews: number;
  // Newest major first, like the list under it, and unlike a path, which is read in the direction
  // the upgrade is performed.
  majors: PathMajor<T>[];
};

// The whole recorded history, read without a path: the same per-major counts a path produces, and
// no verdict. A verdict here would be computed on an upgrade from the oldest recorded Release, which
// nobody performs: correct, and worth nothing. The note names what is on the screen instead.
export function recordedHistory<T extends PathRelease>(releases: readonly T[]): RecordedHistory<T> {
  const sorted = sortByVersion(releases);
  const stable = sorted.filter(({ version }) => version.prerelease.length === 0);
  const latest = stable.at(-1);
  const previews = sorted.filter(({ version }) => version.prerelease.length > 0 && (!latest || compareVersions(version, latest.version) > 0));

  return {
    listed: stable.length + previews.length,
    stable: stable.length,
    previews: previews.length,
    majors: [...splitByMajor(stable).entries()]
      .sort(([a], [b]) => b - a)
      .map(([major, members]) => ({ major, counts: countPath(members), rows: foldDigests(members) })),
  };
}

// The Version in use is validated exactly as the start of an Upgrade Path (GLOSSARY.md), so the two
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
