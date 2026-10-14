import { compareVersions, parseVersion } from "@/modules/releases";
import { isoDate, plural, type Tone } from "@/modules/releases/ui";
import type { DashboardVerdict } from "../domain/build-dashboard";
import type { DashboardRelease, FollowedTechnology } from "../domain/followed";
import type { Standing, StandingRow } from "../domain/standing";
import type { DigestWeek } from "../domain/stream";
import { WINDOW_DAYS } from "../domain/build-dashboard";

export type Verdict = { tone: Tone; label: string; claim: string };

// The page verdict counts Releases, not Technologies, and a Release without a ready Summary is
// never called safe: "nothing needs action" is what we know, not a promise that all is well.
// A null verdict is the page with nothing it can judge, and there it says so instead of reassuring:
// an empty set makes "nothing needs action" true of nothing (CONTEXT.md, Verdetto della Dashboard).
// The muted claim is the short form of `nothing here can be judged yet`: shortened, never wrapped.
// At Column verdict scale the long one measures 516px inside a 360px column, and the rule is that
// the copy gives way, not the scale and not the one line (DESIGN.md, The One-Line Verdict Rule).
export function pageVerdict(verdict: DashboardVerdict | null): Verdict {
  if (verdict === null)
    return { tone: "muted", label: "note:", claim: "nothing judged yet" };
  const { needsAction } = verdict;
  if (needsAction === 0)
    return { tone: "ok", label: "ok:", claim: "nothing needs action" };
  return {
    tone: "action",
    label: "warning:",
    claim: `${needsAction} ${needsAction === 1 ? "needs" : "need"} action`,
  };
}

// The words of a Standing Row's state line, and they are the content: the bar beside them is
// `aria-hidden` (DESIGN.md, Standing Row). A row that needs action takes the ink, bar included.
export function standingWords(row: StandingRow): {
  words: string;
  action: boolean;
} {
  if (row.needsAction > 0) {
    return {
      words: `${row.needsAction} ${row.needsAction === 1 ? "needs" : "need"} action`,
      action: true,
    };
  }
  // CONTEXT.md, Distanza: with no declaration there is no Distance, so there is nothing for a bar
  // to be a share of and the row says exactly that.
  if (row.distance === null)
    return { words: "no version declared", action: false };
  if (row.distance === 0) return { words: "up to date", action: false };
  return { words: `${row.distance} behind ${row.declared}`, action: false };
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
export function totalsRows(standing: Standing): TotalsRow[] {
  if (standing.since === null) return [];
  return [
    { label: "releases behind in all", value: String(standing.behind) },
    ...(standing.missing > 0
      ? [{ label: "without a verdict", value: String(standing.missing) }]
      : []),
    { label: "oldest version declared", value: isoDate(standing.since) },
  ];
}

export const BAR_NOTE =
  "the bar is the distance from the version you declared, not a score";

// The Stream's title names its window and its size (DESIGN.md, Stream Row). The count is the data,
// so a page that has not counted prints no count; the window is a fact about the page and stays.
export function streamTitle(): string {
  return `what happened · last ${WINDOW_DAYS} days`;
}

export function streamCount(total: number): string {
  return `, ${plural(total, "release")}`;
}

export function windowLine(start: Date, end: Date): string {
  return `window: last ${WINDOW_DAYS} days, ${isoDate(start)} to ${isoDate(end)} UTC`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "Dec 2 to 8", and "Nov 25 to Dec 1" when the week changes month: the second month is named only
// when it differs, because repeating it is noise on a line already dense with numbers.
export function weekRange(start: Date, end: Date): string {
  const month = (date: Date) => MONTHS[date.getUTCMonth()];
  const to =
    month(start) === month(end)
      ? `${end.getUTCDate()}`
      : `${month(end)} ${end.getUTCDate()}`;
  return `${month(start)} ${start.getUTCDate()} to ${to}`;
}

// The quiet end of the Stream: one row for the whole stretch that asked nothing, never one per week
// (DESIGN.md, Weekly Digest). The weeks come newest first, so the span reads oldest to newest.
export function hushSpan(weeks: readonly DigestWeek[]): string {
  const numbers = weeks.map(({ week }) => week.week);
  const oldest = numbers.at(-1);
  const newest = numbers[0];
  if (oldest === undefined || newest === undefined) return "";
  return oldest === newest ? `week ${newest}` : `weeks ${oldest} to ${newest}`;
}

export function hushClaim(total: number): string {
  return total === 1
    ? "1 more release, not asking anything"
    : `${total} more releases, none asking anything`;
}

// Digest Releases are never summarized, so a week can only ever say that nothing in it asks for
// work. It is a fact of the Significance, not a verdict read off a Summary.
export const NO_ACTION = "no action needed";

// The one fact a Stream row may say about the declaration: it cites it instead of counting from it,
// because a Distance is a count over a set and the set is the Standing's (DESIGN.md, Stream Row).
export function declarationNote(
  technology: FollowedTechnology,
  release: DashboardRelease,
): string | null {
  const declared = technology.currentVersion?.version;
  if (!declared) return null;
  const left = parseVersion(declared);
  const right = parseVersion(release.version);
  if (!left || !right || compareVersions(left, right) >= 0) return null;
  return `you are on ${declared}`;
}
