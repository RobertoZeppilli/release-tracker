import { sortByVersion } from "./version";

// The Version a Technology is at today: the highest stable one. Prereleases are left out on
// purpose, as on the Technology page, where `groupByMajor` reads `latest` the same way.
export function latestStableVersion(versions: readonly string[]): string | null {
  return latestStableRelease(versions.map((version) => ({ version })))?.version ?? null;
}

// The same Release, not only its Version, for the callers that need what came with it: the Catalog
// row prints the day that Version came out, which is this Release's own date and not the newest
// date the Technology has (DESIGN.md, Catalog Ordering).
export function latestStableRelease<T extends { version: string }>(
  releases: readonly T[],
): T | null {
  const stable = sortByVersion(releases).filter(({ version }) => version.prerelease.length === 0);
  return stable.at(-1)?.release ?? null;
}
