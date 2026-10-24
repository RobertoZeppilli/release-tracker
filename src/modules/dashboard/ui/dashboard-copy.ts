import type { Locale, Translator } from "@/modules/i18n";
import { compareVersions, parseVersion } from "@/modules/releases";
import { isoDate, type Tone } from "@/modules/releases/ui";
import type { DashboardVerdict } from "../domain/build-dashboard";
import type { DashboardRelease, FollowedTechnology } from "../domain/followed";
import type { Standing, StandingRow } from "../domain/standing";
import type { DigestWeek } from "../domain/stream";
import { WINDOW_DAYS } from "../domain/build-dashboard";

export type Verdict = { tone: Tone; label: string; claim: string };

// These functions take `t` instead of holding their sentences: the words are in the dictionary since
// ADR 0008, and what is left here is the choice between them, which is the part worth a test. The
// labels they return (`ok:`, `warning:`, `note:`) are not translated: they are the product's own
// grammar, the same prefixes that appear inside a Summary.

// The page verdict counts Releases, not Technologies, and a Release without a ready Summary is
// never called safe: "nothing needs action" is what we know, not a promise that all is well.
// A null verdict is the page with nothing it can judge, and there it says so instead of reassuring:
// an empty set makes "nothing needs action" true of nothing (GLOSSARY.md, Verdetto della Dashboard).
// The muted claim is the short form of `nothing here can be judged yet`: shortened, never wrapped.
// At Column verdict scale the long one measures 516px inside a 360px column, and the rule is that
// the copy gives way, not the scale and not the one line (DESIGN.md, The One-Line Verdict Rule).
export function pageVerdict(verdict: DashboardVerdict | null, t: Translator): Verdict {
  if (verdict === null)
    return { tone: "muted", label: "note:", claim: t("dashboard.verdict.none") };
  const { needsAction } = verdict;
  if (needsAction === 0)
    return { tone: "ok", label: "ok:", claim: t("dashboard.verdict.ok") };
  return {
    tone: "action",
    label: "warning:",
    claim: t("dashboard.needsAction", { count: needsAction }),
  };
}

// The words of a Standing Row's state line, and they are the content: the bar beside them is
// `aria-hidden` (DESIGN.md, Standing Row). A row that needs action takes the ink, bar included.
export function standingWords(
  row: StandingRow,
  t: Translator,
): { words: string; action: boolean } {
  if (row.needsAction > 0) {
    return {
      words: t("dashboard.needsAction", { count: row.needsAction }),
      action: true,
    };
  }
  // GLOSSARY.md, Distanza: with no declaration there is no Distance, so there is nothing for a bar
  // to be a share of and the row says exactly that.
  if (row.distance === null)
    return { words: t("dashboard.standing.noVersion"), action: false };
  if (row.distance === 0)
    return { words: t("dashboard.standing.upToDate"), action: false };
  return {
    words: t("dashboard.standing.behind", {
      count: row.distance,
      declared: row.declared ?? "",
    }),
    action: false,
  };
}

// The bar's width: this row's Distance as a share of the longest in the list. Null wherever no bar
// is drawn, which is a row with no Distance and a list too short for the lane to mean anything.
export function barShare(
  row: StandingRow,
  scale: number | null,
): number | null {
  if (row.distance === null || scale === null) return null;
  return scale === 0 ? 0 : Math.round((row.distance / scale) * 100);
}

export type TotalsRow = { label: string; value: string };

// The figures of the Standing Panel, a label and a value each (DESIGN.md, Standing Panel). The
// first counts the whole and the last names the oldest declaration, because a total is only as
// fresh as the stalest thing under it; where nobody declared there is no count to print at all,
// and the panel keeps its title alone. They are rows and not one sentence: these numbers are what
// the column is read for, and a sentence that wraps three times hides them in prose.
export function totalsRows(standing: Standing, t: Translator): TotalsRow[] {
  if (standing.since === null) return [];
  return [
    { label: t("dashboard.totals.behind"), value: String(standing.behind) },
    ...(standing.missing > 0
      ? [{ label: t("dashboard.totals.missing"), value: String(standing.missing) }]
      : []),
    { label: t("dashboard.totals.since"), value: isoDate(standing.since) },
  ];
}

// The Stream's title names its window and its size (DESIGN.md, Stream Row). The count is the data,
// so a page that has not counted prints no count; the window is a fact about the page and stays.
export function streamTitle(t: Translator): string {
  return t("dashboard.stream.title", { days: WINDOW_DAYS });
}

export function streamCount(total: number, t: Translator): string {
  return t("dashboard.stream.count", { count: total });
}

export function windowLine(start: Date, end: Date, t: Translator): string {
  return t("dashboard.stream.window", {
    days: WINDOW_DAYS,
    start: isoDate(start),
    end: isoDate(end),
  });
}

// "Dec 2 to 8", and "Nov 25 to Dec 1" when the week changes month: the second month is named only
// when it differs, because repeating it is noise on a line already dense with numbers.
// The month comes from `Intl` in the page's language, so no dictionary lists twelve months; the
// order of the month and the day is a message, because `2 dic` is the Italian of `Dec 2`.
export function weekRange(start: Date, end: Date, t: Translator, locale: Locale): string {
  const months = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const day = (date: Date) =>
    t("dashboard.week.day", { month: months.format(date), day: date.getUTCDate() });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return t("dashboard.week.range", {
    start: day(start),
    end: sameMonth ? String(end.getUTCDate()) : day(end),
  });
}

// The quiet end of the Stream: one row for the whole stretch that asked nothing, never one per week
// (DESIGN.md, Weekly Digest). The weeks come newest first, so the span reads oldest to newest.
export function hushSpan(weeks: readonly DigestWeek[], t: Translator): string {
  const numbers = weeks.map(({ week }) => week.week);
  const oldest = numbers.at(-1);
  const newest = numbers[0];
  if (oldest === undefined || newest === undefined) return "";
  return oldest === newest
    ? t("dashboard.week.number", { week: newest })
    : t("dashboard.digest.span.many", { from: oldest, to: newest });
}

export function hushClaim(total: number, t: Translator): string {
  return t("dashboard.digest.claim", { count: total });
}

// The one fact a Stream row may say about the declaration: it cites it instead of counting from it,
// because a Distance is a count over a set and the set is the Standing's (DESIGN.md, Stream Row).
export function declarationNote(
  technology: FollowedTechnology,
  release: DashboardRelease,
  t: Translator,
): string | null {
  const declared = technology.currentVersion?.version;
  if (!declared) return null;
  const left = parseVersion(declared);
  const right = parseVersion(release.version);
  if (!left || !right || compareVersions(left, right) >= 0) return null;
  return t("dashboard.stream.declaration", { version: declared });
}
