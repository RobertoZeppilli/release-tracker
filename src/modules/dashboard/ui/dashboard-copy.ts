import { isoDate, plural, type Tone } from "@/modules/releases/ui";
import type {
  BehindStanding,
  DashboardCounts,
  DashboardVerdict,
  InUseTotals,
} from "../domain/build-dashboard";

export type Verdict = { tone: Tone; label: string; claim: string; pending?: true };

// The page verdict counts Releases, not Technologies, and a Release without a ready Summary is
// never called safe: "nothing needs action" is what we know, not a promise that all is well.
// A null verdict is the page with nothing it can judge, and there it says so instead of reassuring:
// an empty set makes "nothing needs action" true of nothing (CONTEXT.md, Verdetto della Dashboard).
export function pageVerdict(verdict: DashboardVerdict | null): Verdict {
  if (verdict === null) return { tone: "muted", label: "note:", claim: "nothing here can be judged yet" };
  const { needsAction } = verdict;
  if (needsAction === 0) return { tone: "ok", label: "ok:", claim: "nothing needs action" };
  return { tone: "action", label: "warning:", claim: `${needsAction} ${needsAction === 1 ? "needs" : "need"} action` };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Dec 2 to 8", and "Nov 25 to Dec 1" when the week changes month: the second month is named only
// when it differs, because repeating it is noise on a line already dense with numbers.
export function weekRange(start: Date, end: Date): string {
  const month = (date: Date) => MONTHS[date.getUTCMonth()];
  const to = month(start) === month(end) ? `${end.getUTCDate()}` : `${month(end)} ${end.getUTCDate()}`;
  return `${month(start)} ${start.getUTCDate()} to ${to}`;
}

// The two things built on the Version in use. Both name the day the declaration was made, because it
// is the one fact that tells a reader whether the count in front of it still means anything: the app
// never checks a declaration, so a count on top of it is exactly as old as the declaration is.
function actionWords(count: number): string {
  return count === 1 ? "needs action" : "need action";
}

function needWord(count: number): string {
  return `${count} ${actionWords(count)}`;
}

// The two count boxes. A box is a caption and a list of rows, each row a label on the left and its
// number on the right: the facts used to run as one sentence of items separated by `·`, which on a
// phone wrapped in the middle of the numbers (DESIGN.md, Count Box).
export type CountRow = {
  key: string;
  label: string;
  value: number;
  href: string;
  // A count points at a section only where that section exists; Spotlight is always on the page.
  linked: boolean;
  // Issue #94: a number of narrower scope says its own scope where it stands, so `need action` stays
  // inside the `featured` row instead of becoming a row of its own.
  note: { value: number; words: string } | null;
};

export type FactRow = { label: string; value: string };

export function windowCaption(technologies: number): string {
  return `last 30 days · ${technologies} ${technologies === 1 ? "technology" : "technologies"}`;
}

export function windowRows(counts: DashboardCounts): CountRow[] {
  return [
    {
      key: "featured",
      label: "featured",
      value: counts.featured,
      href: "#spotlight",
      linked: true,
      note:
        counts.featuredNeedsAction > 0
          ? { value: counts.featuredNeedsAction, words: actionWords(counts.featuredNeedsAction) }
          : null,
    },
    { key: "notable", label: "notable", value: counts.notable, href: "#latest", linked: counts.notable > 0, note: null },
    {
      key: "previews",
      label: counts.previews === 1 ? "preview" : "previews",
      value: counts.previews,
      href: "#previews",
      linked: counts.previews > 0,
      note: null,
    },
    { key: "digest", label: "digest", value: counts.digest, href: "#digest", linked: counts.digest > 0, note: null },
  ];
}

export function inUseCaption(totals: InUseTotals, technologies: number): string {
  return `version in use · ${totals.declared} of ${technologies}`;
}

export function inUseRows(totals: InUseTotals): FactRow[] {
  return [
    { label: totals.behind === 1 ? "release behind" : "releases behind", value: `${totals.behind}` },
    ...(totals.needsAction > 0 ? [{ label: actionWords(totals.needsAction), value: `${totals.needsAction}` }] : []),
    { label: "oldest declared", value: isoDate(totals.since) },
  ];
}

// The quiet half of Spotlight. Every followed Technology is accounted for once, so the ones with
// nothing featured keep a row; what they do not keep is the sentence saying it, which used to repeat
// word for word on each of them and spent the whole content column saying the same nothing. The
// group says it once, above the rows.
export function quietNote(quiet: number, total: number): string {
  return `${quiet} of the ${total} you follow had nothing featured`;
}

export function behindLine(standing: BehindStanding): string {
  const parts =
    standing.counts.total === 0
      ? [`already on ${standing.to}`]
      : [
          `${plural(standing.counts.total, "release")} behind ${standing.to}`,
          ...(standing.counts.actionRequired > 0 ? [needWord(standing.counts.actionRequired)] : []),
          ...(standing.counts.missing > 0 ? [`${standing.counts.missing} without a verdict`] : []),
        ];
  return `in use ${standing.version} since ${isoDate(standing.declaredAt)} · ${parts.join(" · ")}`;
}
