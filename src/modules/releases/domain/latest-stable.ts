import { sortByVersion } from "./version";

// The Version a Technology is at today: the highest stable one. Prereleases are left out on
// purpose, as on the Technology page, where `groupByMajor` reads `latest` the same way.
export function latestStableVersion(versions: readonly string[]): string | null {
  const stable = sortByVersion(versions.map((version) => ({ version }))).filter(
    ({ version }) => version.prerelease.length === 0,
  );
  return stable.at(-1)?.release.version ?? null;
}
