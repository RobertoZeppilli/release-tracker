import type { DefaultStartReason } from "../domain/default-upgrade-start";
import type { Tone } from "../domain/row-verdict";
import type { InvalidFrom, PathCounts, RecordedHistory } from "../domain/upgrade-path";

export type { Tone };

export type Verdict = { tone: Tone; label: string; claim: string };

// The three significance levels a bar is made of, in the order it fills them (DESIGN.md, Stat Row).
// `preview` is not one of them: the previews are listed apart from the path, so no bar carries them.
export const BAR_LEVELS = ["featured", "notable", "digest"] as const;
export type BarLevel = (typeof BAR_LEVELS)[number];

// DESIGN.md, Stat Row: the legend lists only the levels that appear in the bars, so it never
// explains a fill the reader cannot find in them. `needs action` is last and is not a level: it is
// the one lane that cuts across the partition, so it is listed only when a bar carries it.
export function legendLevels(groups: readonly PathCounts[]): BarLevel[] {
  return BAR_LEVELS.filter((level) => groups.some((group) => group[level] > 0));
}

export function barHasAction(groups: readonly PathCounts[]): boolean {
  return groups.some((group) => group.actionRequired > 0);
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// Releases without a ready Summary are never called safe (CONTEXT.md, Cammino di upgrade). The
// verdict counts all of `missing`, while the Stat Row beside it splits that number in two, so it
// cannot borrow either half's word: `to check` belongs to `unjudged` alone (see missingWords).
export function pathVerdict(counts: PathCounts): Verdict {
  if (counts.actionRequired > 0) return { tone: "action", label: "warning:", claim: count(counts.actionRequired, "needs action", "need action") };
  if (counts.missing > 0) return { tone: "muted", label: "note:", claim: `${counts.missing} without a verdict` };
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

export type PathRow = { count: number; words: string };

// The same reading as `pathSentence`, as the rows of the panel that holds the verdict: one number
// per line, the numbers in a column of their own. A sentence had to carry the clauses with commas,
// an "and" and a trailing stop, and a reader counting what they face had to parse the prose to find
// the numbers again; the rows put the numbers where the eye goes first. ⚠️ No `·` anywhere here: a
// `·` earns its place between facts on one line, never between lines (DESIGN.md, Upgrade Panel).
//
// The total keeps the two Versions beside it, because that is what the clauses are counted over, and
// it is the only row whose number has no clause of its own.
export function pathRows(from: string, to: string, counts: PathCounts): PathRow[] {
  if (counts.total === 0) return [];
  return [
    { count: counts.total, words: `${counts.total === 1 ? "release" : "releases"}, ${from} to ${to}` },
    { count: counts.actionRequired, words: counts.actionRequired === 1 ? "needs action" : "need action" },
    { count: counts.safe, words: "safe to upgrade" },
    { count: counts.missing - counts.unjudged, words: "no summary yet" },
    { count: counts.unjudged, words: "notes too thin to judge" },
    { count: counts.digest, words: counts.digest === 1 ? "digest fix you can skip" : "digest fixes you can skip" },
  ].filter((row, index) => index === 0 || row.count > 0);
}

// The note over the whole recorded history. It names what is on the screen and claims nothing about
// an upgrade, because this view has no start to measure one from.
export function historySentence({ stable, previews, majors }: RecordedHistory<unknown>): string {
  if (stable === 0) return previews === 0 ? "nothing recorded yet." : `the whole recorded history, ${count(previews, "upcoming preview", "upcoming previews")}.`;
  const history = `the whole recorded history, ${count(stable, "release", "releases")} in ${count(majors.length, "major", "majors")}`;
  return previews === 0 ? `${history}.` : `${history}, and ${count(previews, "upcoming preview", "upcoming previews")}.`;
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

// A start the page chose on its own: the note says which Release it is and why that one, so the
// counts under it are not read as an answer to a question the reader asked.
export function defaultStartNote(version: string, reason: DefaultStartReason): string {
  const which = reason === "previousMajor" ? "the last release of the previous major" : "the oldest release recorded";
  return `starting from ${version}, ${which}, because no version was given.`;
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
