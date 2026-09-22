// The shape of a SemVer Version. It describes the Version, never its Significance (ADR 0001).
export type ParsedVersion = { major: number; minor: number; patch: number; prerelease: string[] };

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseVersion(version: string): ParsedVersion | null {
  const match = SEMVER.exec(version);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] === undefined ? [] : match[4].split("."),
  };
}

// SemVer precedence: a Version without prerelease ranks above its prereleases.
export function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  const core = a.major - b.major || a.minor - b.minor || a.patch - b.patch;
  if (core !== 0) return core;
  if (a.prerelease.length === 0 || b.prerelease.length === 0) return b.prerelease.length - a.prerelease.length;
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const order = compareIdentifier(a.prerelease[i], b.prerelease[i]);
    if (order !== 0) return order;
  }
  return 0;
}

function compareIdentifier(a: string | undefined, b: string | undefined): number {
  if (a === undefined || b === undefined) return a === undefined ? (b === undefined ? 0 : -1) : 1;
  const numeric = /^\d+$/;
  if (numeric.test(a) && numeric.test(b)) return Number(a) - Number(b);
  if (numeric.test(a) !== numeric.test(b)) return numeric.test(a) ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

export type Versioned<T> = { release: T; version: ParsedVersion };

// Releases whose Version is not SemVer cannot be placed in order, so they are left out.
export function sortByVersion<T extends { version: string }>(releases: readonly T[]): Versioned<T>[] {
  return releases
    .flatMap((release) => {
      const version = parseVersion(release.version);
      return version ? [{ release, version }] : [];
    })
    .sort((a, b) => compareVersions(a.version, b.version));
}

// Keeps the order it is given, within and across majors.
export function splitByMajor<T>(sorted: readonly Versioned<T>[]): Map<number, T[]> {
  const byMajor = new Map<number, T[]>();
  for (const { release, version } of sorted) byMajor.set(version.major, [...(byMajor.get(version.major) ?? []), release]);
  return byMajor;
}
