import type { Significance } from "./significance";
import { compareVersions, parseVersion } from "./version";

export type ListedRelease = { version: string; significance: Significance; publishedAt: Date };

export type MajorRow<T> = { type: "release"; release: T } | { type: "digest"; releases: T[] };

export type MajorGroup<T> = { major: number; count: number; rows: MajorRow<T>[] };

export type GroupedReleases<T> = { latest: string | null; majors: MajorGroup<T>[]; previews: T[] };

// The Technology page: stable Releases by major, newest major first; digest runs fold into one row.
// Previews already followed by their stable Version are left out; the upcoming ones are listed apart.
export function groupByMajor<T extends ListedRelease>(releases: readonly T[]): GroupedReleases<T> {
  const parsed = releases
    .flatMap((release) => {
      const version = parseVersion(release.version);
      return version ? [{ release, version }] : [];
    })
    .sort((a, b) => compareVersions(a.version, b.version));

  const stable = parsed.filter(({ version }) => version.prerelease.length === 0);
  const latest = stable.at(-1);
  const previews = parsed
    .filter(({ version }) => version.prerelease.length > 0 && (!latest || compareVersions(version, latest.version) > 0))
    .map(({ release }) => release);

  const byMajor = new Map<number, T[]>();
  for (const { release, version } of stable) byMajor.set(version.major, [...(byMajor.get(version.major) ?? []), release]);

  const majors = [...byMajor.entries()]
    .sort(([a], [b]) => b - a)
    .map(([major, members]) => ({ major, count: members.length, rows: foldDigests(members) }));

  return { latest: latest?.release.version ?? null, majors, previews };
}

function foldDigests<T extends ListedRelease>(releases: readonly T[]): MajorRow<T>[] {
  const rows: MajorRow<T>[] = [];
  for (const release of releases) {
    const last = rows.at(-1);
    if (release.significance !== "digest") rows.push({ type: "release", release });
    else if (last?.type === "digest") last.releases.push(release);
    else rows.push({ type: "digest", releases: [release] });
  }
  return rows;
}
