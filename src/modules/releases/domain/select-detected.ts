import type { Significance } from "./significance";
import { parseVersion } from "./version";

export type DetectionCandidate = { version: string; significance: Significance; publishedAt: Date };

// `summarize` is the judgement of the Detection alone; without Release Notes there is no Summary,
// and that is decided later, where the notes are known.
export type DetectedRelease<T> = T & { summarize: boolean };

// What the database already holds for the Technology, as the Detection needs to see it.
export type KnownReleases = { versions: readonly string[]; latestPublishedAt: Date | null };

// Which of the Versions a Source reports are new Releases, and which of them deserve a Summary.
//
// New means published after the newest Release we hold, not merely absent: the Initial Import keeps
// only the last 12 months, so everything older is a deliberate omission the Detection must not undo.
// A Technology without Releases is left to the Initial Import.
export function selectDetected<T extends DetectionCandidate>(
  candidates: readonly T[],
  known: KnownReleases,
): DetectedRelease<T>[] {
  const latest = known.latestPublishedAt;
  if (latest === null) return [];
  const knownVersions = new Set(known.versions);
  const previewedMajors = majorsOf(known.versions);

  return candidates
    .filter((release) => !knownVersions.has(release.version) && release.publishedAt > latest)
    .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
    .map((release) => ({ ...release, summarize: summarize(release, previewedMajors) }));
}

// Only the first Preview of a major gets a Summary (GLOSSARY.md): once the major has any Release,
// stable or Preview, the following betas and rcs are `skipped`.
function summarize(release: DetectionCandidate, seenMajors: Set<number>): boolean {
  if (release.significance === "digest") return false;
  if (release.significance !== "preview") return true;
  const major = parseVersion(release.version)?.major;
  if (major === undefined) return false;
  const first = !seenMajors.has(major);
  seenMajors.add(major);
  return first;
}

function majorsOf(versions: readonly string[]): Set<number> {
  const majors = new Set<number>();
  for (const version of versions) {
    const major = parseVersion(version)?.major;
    if (major !== undefined) majors.add(major);
  }
  return majors;
}
