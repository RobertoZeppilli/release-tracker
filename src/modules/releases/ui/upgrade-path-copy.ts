import type { Translator } from "@/modules/i18n";
import type { DefaultStartReason } from "../domain/default-upgrade-start";
import type { Tone } from "../domain/row-verdict";
import type { InvalidFrom, PathCounts, RecordedHistory } from "../domain/upgrade-path";

export type { Tone };

export type Verdict = { tone: Tone; label: string; claim: string };

// These functions take `t` since ADR 0008: the sentences live in the dictionary and what is left
// here is the choice between them, which is the part a test is worth. The labels they return
// (`warning:`, `note:`, `ok:`) are the product's grammar and are never translated.

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

// Releases without a ready Summary are never called safe (GLOSSARY.md, Cammino di upgrade). The
// verdict counts all of `missing`, while the Stat Row beside it splits that number in two, so it
// cannot borrow either half's word: `to check` belongs to `unjudged` alone (see missingWords).
export function pathVerdict(counts: PathCounts, t: Translator): Verdict {
  if (counts.actionRequired > 0)
    return {
      tone: "action",
      label: "warning:",
      claim: t("path.verdict.action", { count: counts.actionRequired }),
    };
  if (counts.missing > 0)
    return { tone: "muted", label: "note:", claim: t("path.verdict.missing", { count: counts.missing }) };
  if (counts.total === 0) return { tone: "ok", label: "ok:", claim: t("path.verdict.upToDate") };
  return { tone: "ok", label: "ok:", claim: t("path.safe") };
}

// The clauses of the sentence, joined with a comma and an `and` that the dictionary writes: the
// comma is punctuation these five languages share, the conjunction is not.
function joinClauses(clauses: readonly string[], t: Translator): string {
  if (clauses.length <= 1) return clauses[0] ?? "";
  return t("path.list.last", { items: clauses.slice(0, -1).join(", "), last: clauses.at(-1) ?? "" });
}

export function pathSentence(from: string, to: string, counts: PathCounts, t: Translator): string {
  if (counts.total === 0) return t("path.sentence.latest", { from });
  const noSummary = counts.missing - counts.unjudged;
  const clauses = [
    counts.actionRequired > 0 && t("path.clause.action", { count: counts.actionRequired }),
    counts.safe > 0 && t("path.clause.safe", { count: counts.safe }),
    noSummary > 0 && t("path.clause.noSummary", { count: noSummary }),
    counts.unjudged > 0 && t("path.clause.unjudged", { count: counts.unjudged }),
    counts.digest > 0 && t("path.clause.digest", { count: counts.digest }),
  ].filter((clause): clause is string => clause !== false);
  return t("path.sentence.all", {
    from,
    to,
    total: t("path.sentence.total", { count: counts.total }),
    list: joinClauses(clauses, t),
  });
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
export function pathRows(from: string, to: string, counts: PathCounts, t: Translator): PathRow[] {
  if (counts.total === 0) return [];
  return [
    { count: counts.total, words: t("path.row.total", { count: counts.total, from, to }) },
    { count: counts.actionRequired, words: t("path.row.action", { count: counts.actionRequired }) },
    { count: counts.safe, words: t("path.safe") },
    { count: counts.missing - counts.unjudged, words: t("path.row.noSummary") },
    { count: counts.unjudged, words: t("path.row.unjudged") },
    { count: counts.digest, words: t("path.row.digest", { count: counts.digest }) },
  ].filter((row, index) => index === 0 || row.count > 0);
}

// The note over the whole recorded history. It names what is on the screen and claims nothing about
// an upgrade, because this view has no start to measure one from.
export function historySentence(
  { stable, previews, majors }: RecordedHistory<unknown>,
  t: Translator,
): string {
  const upcoming = t("path.count.previews", { count: previews });
  if (stable === 0)
    return previews === 0
      ? t("path.history.nothing")
      : t("path.history.previewsOnly", { previews: upcoming });
  const counted = {
    releases: t("path.count.releases", { count: stable }),
    majors: t("path.count.majors", { count: majors.length }),
  };
  return previews === 0
    ? t("path.history.all", counted)
    : t("path.history.allAndPreviews", { ...counted, previews: upcoming });
}

// The words beside each bar: the bar is decoration, these carry the numbers.
export function majorWords(
  counts: PathCounts,
  t: Translator,
): { kinds: string; action: string | null; missing: string | null } {
  const kinds = [
    t("path.count.releases", { count: counts.total }),
    counts.featured > 0 && t("path.kind.featured", { count: counts.featured }),
    counts.notable > 0 && t("path.kind.notable", { count: counts.notable }),
    counts.digest > 0 && t("path.kind.digest", { count: counts.digest }),
  ].filter((part): part is string => part !== false);
  return {
    kinds: kinds.join(" · "),
    // The clause and not the panel row: beside a bar the words carry the number, because the bar
    // only draws it.
    action: counts.actionRequired > 0 ? t("path.clause.action", { count: counts.actionRequired }) : null,
    missing: missingWords(counts, t),
  };
}

// `missing` holds two different facts, and neither may be printed as the other: a Release with no
// Summary is not summarized, one whose notes could not be judged is there to be checked.
function missingWords({ missing, unjudged }: PathCounts, t: Translator): string | null {
  const parts = [
    missing - unjudged > 0 && t("path.missing.notSummarized", { count: missing - unjudged }),
    unjudged > 0 && t("path.missing.toCheck", { count: unjudged }),
  ].filter((part): part is string => part !== false);
  return parts.length > 0 ? parts.join(" · ") : null;
}

// A start the page chose on its own: the note says which Release it is and why that one, so the
// counts under it are not read as an answer to a question the reader asked.
export function defaultStartNote(
  version: string,
  reason: DefaultStartReason,
  t: Translator,
): string {
  return t("path.start.note", {
    version,
    which: t(reason === "previousMajor" ? "path.start.previousMajor" : "path.start.oldest"),
  });
}

export function invalidMessage(
  reason: InvalidFrom,
  from: string,
  latest: string | null,
  t: Translator,
): string {
  switch (reason) {
    case "malformed":
      return t("path.invalid.malformed", {
        from: from || t("path.invalid.empty"),
        example: latest ?? "1.2.3",
      });
    case "notOlder":
      return t("path.invalid.notOlder", { from, latest: latest ?? "" });
    case "noStable":
      return t("path.invalid.noStable");
  }
}
