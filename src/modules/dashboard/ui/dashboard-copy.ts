import { isoDate, plural, type Tone } from "@/modules/releases/ui";
import type { BehindStanding, DashboardRelease, DashboardVerdict, InUseTotals } from "../domain/build-dashboard";

export type Verdict = { tone: Tone; label: string; claim: string; pending?: true };

// The page verdict counts Releases, not Technologies, and a Release without a ready Summary is
// never called safe: "nothing needs action" is what we know, not a promise that all is well.
export function pageVerdict({ needsAction }: DashboardVerdict): Verdict {
  if (needsAction === 0) return { tone: "ok", label: "ok:", claim: "nothing needs action" };
  return { tone: "action", label: "warning:", claim: `${needsAction} ${needsAction === 1 ? "needs" : "need"} action` };
}

// How one row reads its own Summary. A Release is called safe only by a ready Summary that says so;
// everything else says what is missing and where to look instead.
export function rowVerdict({ summary, summaryStatus }: DashboardRelease): Verdict {
  if (summary?.actionRequired === true) {
    const count = summary.breakingChanges.length;
    return { tone: "action", label: "warning:", claim: `action required · ${plural(count, "breaking change")}` };
  }
  if (summary?.actionRequired === false) return { tone: "ok", label: "ok:", claim: "safe to upgrade" };
  if (summaryStatus === "pending" || summaryStatus === "processing") {
    return { tone: "muted", label: "pending:", claim: "summary queued", pending: true };
  }
  return { tone: "muted", label: "note:", claim: "no summary · read the release notes" };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Dec 2 to 8", and "Nov 25 to Dec 1" when the week changes month: the second month is named only
// when it differs, because repeating it is noise on a line already dense with numbers.
export function weekRange(start: Date, end: Date): string {
  const month = (date: Date) => MONTHS[date.getUTCMonth()];
  const to = month(start) === month(end) ? `${end.getUTCDate()}` : `${month(end)} ${end.getUTCDate()}`;
  return `${month(start)} ${start.getUTCDate()} to ${to}`;
}

// The two lines built on the Version in use. Both name the day the declaration was made, because it
// is the one fact that tells a reader whether the count in front of it still means anything: the app
// never checks a declaration, so a count on top of it is exactly as old as the declaration is.
function needWord(count: number): string {
  return `${count} ${count === 1 ? "needs" : "need"} action`;
}

export function inUseTotalsLine(totals: InUseTotals, technologies: number): string {
  const parts = [
    totals.behind === 0 ? "all up to date" : `${plural(totals.behind, "release")} behind`,
    ...(totals.needsAction > 0 ? [needWord(totals.needsAction)] : []),
    `oldest declared ${isoDate(totals.since)}`,
  ];
  return `In use on ${totals.declared} of ${technologies}: ${parts.join(" · ")}.`;
}

export function behindLine(standing: BehindStanding): string {
  const parts =
    standing.counts.total === 0
      ? [`already on ${standing.to}`]
      : [
          `${plural(standing.counts.total, "release")} behind ${standing.to}`,
          ...(standing.counts.actionRequired > 0 ? [needWord(standing.counts.actionRequired)] : []),
          ...(standing.counts.missing > 0 ? [`${standing.counts.missing} to check`] : []),
        ];
  return `in use ${standing.version} since ${isoDate(standing.declaredAt)} · ${parts.join(" · ")}`;
}
