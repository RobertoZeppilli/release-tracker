import type { InvalidFrom, PathCounts } from "../domain/upgrade-path";
import { isoDate } from "./release-rows";

export type Tone = "action" | "ok" | "muted" | "breaking";

export type Verdict = { tone: Tone; label: string; claim: string };

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// Releases without a ready Summary are never called safe (CONTEXT.md, Cammino di upgrade).
export function pathVerdict(counts: PathCounts): Verdict {
  if (counts.actionRequired > 0) return { tone: "action", label: "warning:", claim: count(counts.actionRequired, "needs action", "need action") };
  if (counts.missing > 0) return { tone: "muted", label: "note:", claim: `${counts.missing} to check` };
  if (counts.total === 0) return { tone: "ok", label: "ok:", claim: "up to date" };
  return { tone: "ok", label: "ok:", claim: "safe to upgrade" };
}

export function pathSentence(from: string, to: string, counts: PathCounts): string {
  if (counts.total === 0) return `${from} is already the latest stable release.`;
  const clauses = [
    counts.actionRequired > 0 && count(counts.actionRequired, "needs action", "need action"),
    counts.safe > 0 && count(counts.safe, "is safe to upgrade", "are safe to upgrade"),
    counts.missing - counts.unjudged > 0 &&
      count(counts.missing - counts.unjudged, "has no summary yet (check its notes)", "have no summary yet (check their notes)"),
    counts.unjudged > 0 &&
      count(counts.unjudged, "has notes too thin to judge", "have notes too thin to judge"),
    counts.digest > 0 && count(counts.digest, "is a digest fix you can skip", "are digest fixes you can skip"),
  ].filter((clause) => clause !== false);
  const list = clauses.length > 1 ? `${clauses.slice(0, -1).join(", ")} and ${clauses.at(-1)}` : clauses[0];
  return `Between ${from} and ${to} there ${counts.total === 1 ? "is 1 release" : `are ${counts.total} releases`}: ${list}.`;
}

// The words beside each bar: the bar is decoration, these carry the numbers.
export function majorWords(counts: PathCounts): { kinds: string; action: string | null; missing: string | null } {
  const kinds = [
    count(counts.total, "release", "releases"),
    counts.featured > 0 && `${counts.featured} featured`,
    counts.notable > 0 && `${counts.notable} notable`,
    counts.digest > 0 && `${counts.digest} digest`,
  ].filter((part) => part !== false);
  return {
    kinds: kinds.join(" · "),
    action: counts.actionRequired > 0 ? count(counts.actionRequired, "needs action", "need action") : null,
    missing: missingWords(counts),
  };
}

// `missing` holds two different facts, and neither may be printed as the other: a Release with no
// Summary is not summarized, one whose notes could not be judged is there to be checked.
function missingWords({ missing, unjudged }: PathCounts): string | null {
  const parts = [missing - unjudged > 0 && `${missing - unjudged} not summarized`, unjudged > 0 && `${unjudged} to check`];
  const words = parts.filter((part) => part !== false);
  return words.length > 0 ? words.join(" · ") : null;
}

// A declaration the app never verifies: the note names the day it was made, so the numbers under it
// can be read for what they are worth.
export function declaredStartNote(version: string, declaredAt: Date): string {
  return `starting from ${version}, the version you declared in use on ${isoDate(declaredAt)}.`;
}

export function invalidMessage(reason: InvalidFrom, from: string, latest: string | null): string {
  switch (reason) {
    case "malformed":
      return `${from || "An empty value"} is not a version. Write it as major.minor.patch, for example ${latest ?? "1.2.3"}.`;
    case "notOlder":
      return `${from} is newer than ${latest}, the latest stable release.`;
    case "noStable":
      return "There is no stable release yet, so there is no upgrade path.";
  }
}
