import { SeverityLabel } from "@/modules/releases/ui";
import type { DashboardVerdict } from "../domain/build-dashboard";
import type { Standing } from "../domain/standing";
import {
  BAR_NOTE,
  pageVerdict,
  standingTitle,
  totalsLines,
} from "./dashboard-copy";
import { ColumnTitle } from "./column-title";
import { StandingQuotaNote } from "./quota-note";
import { StandingRow } from "./standing-row";

// The left half of the Dashboard, and the answer to *where does my stack stand* (DESIGN.md,
// Standing Column). Three parts in fixed order: the verdict, the column's own title, then the list,
// which scrolls inside itself so the verdict above it and the totals below it never leave.
export function StandingColumn({
  verdict,
  standing,
}: {
  verdict: DashboardVerdict | null;
  standing: Standing;
}) {
  const { tone, label, claim } = pageVerdict(verdict);
  const totals = totalsLines(standing);

  // The sticky column lives inside a plain grid item stretched to the row's height: a sticky grid
  // item is not clamped by its own grid area, so the column used to slide past the end of the split
  // and paint over the line under it.
  return (
    <div className="self-stretch">
      <aside
        aria-labelledby="standing-title"
        className="flex flex-col min-[1041px]:sticky min-[1041px]:top-[72px] min-[1041px]:max-h-[calc(100vh-72px-var(--spacing-6))]"
      >
        {/* The slot keeps its height before there is a verdict: a page that has counted nothing does
          not get to make a claim, not even a muted one (DESIGN.md, Dashboard States). */}
        <div className="mb-5 min-h-[calc(var(--text-column-verdict)*1.15)]">
          <p
            id="page-verdict"
            className="font-mono text-column-verdict whitespace-nowrap tabular-nums"
          >
            <SeverityLabel tone={tone} label={label} /> {claim}
          </p>
        </div>

        <ColumnTitle id="standing-title">{standingTitle()}</ColumnTitle>

        {/* The list is a group with a name of its own: the quota in the top bar already answers to
          "Followed technologies", and two things on a page under one name is one name too many. */}
        <div
          role="group"
          aria-label="Followed technologies, by distance"
          className="stack-scroll min-h-0 border-t border-rule-strong max-[1040px]:stack-scroll-off"
        >
          {standing.rows.map((row) => (
            <StandingRow
              key={row.technology.slug}
              row={row}
              scale={standing.scale}
            />
          ))}
        </div>

        <div className="border-t border-rule-strong pt-3 font-mono text-label text-text-faint">
          {totals.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {/* Not a caption to drop when space is tight: the bar is the one thing here a reader could
            mistake for a score (DESIGN.md, The totals). It goes only where the bar goes. */}
          {standing.scale !== null && <p>{BAR_NOTE}</p>}
          <StandingQuotaNote />
        </div>
      </aside>
    </div>
  );
}
