import { sortByVersion } from "./version";

// Why the path starts where it does, which the page has to say: the reader never asked for it.
export type DefaultStartReason = "previousMajor" | "oldest";

export type DefaultStart = { version: string; reason: DefaultStartReason };

// GLOSSARY.md, Cammino di upgrade: the start the page derives when no Version was given and none is
// declared in use. The last Release of the previous major, so the path always contains the major
// Release itself, which is where the breaking changes are. Below one major there is no jump to
// show, so the oldest recorded Release stands in; with a single stable Release there is no path at
// all and the page stays the plain list.
export function defaultUpgradeStart(releases: readonly { version: string }[]): DefaultStart | null {
  const stable = sortByVersion(releases).filter(({ version }) => version.prerelease.length === 0);
  const latest = stable.at(-1);
  if (!latest || stable.length === 1) return null;
  const previous = stable.filter(({ version }) => version.major < latest.version.major).at(-1);
  if (previous) return { version: previous.release.version, reason: "previousMajor" };
  return { version: stable[0].release.version, reason: "oldest" };
}
