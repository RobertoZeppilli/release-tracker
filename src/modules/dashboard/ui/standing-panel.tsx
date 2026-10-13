import type { Standing } from "../domain/standing";
import { BAR_NOTE, standingTitle, totalsRows } from "./dashboard-copy";
import { ColumnTitle } from "./column-title";
import { StandingQuotaNote } from "./quota-note";

// DESIGN.md, Standing Panel: the head of the Standing column, on the one raised surface the system
// has. It holds the column's title and the totals of the list under it, as figures in a column
// instead of one sentence that wrapped over three lines: the numbers are what a reader comes back
// to this column for, and a wrapped sentence hides them in prose.
export function StandingPanel({ standing }: { standing: Standing }) {
  const rows = totalsRows(standing);

  return (
    <div className="mb-5 rounded-md border border-rule bg-raised p-4">
      <ColumnTitle id="standing-title">{standingTitle()}</ColumnTitle>

      {rows.length > 0 && (
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 font-mono text-label text-text-faint">
          {rows.map(({ label, value }) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt>{label}</dt>
              {/* Right-aligned and tabular: the figures line up on their last digit, which is what
                  makes a column of numbers readable without reading it. */}
              <dd className="m-0 text-right text-text tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Not a caption to drop when space is tight: the bar is the one thing here a reader could
          mistake for a score (DESIGN.md, The Standing Panel). It goes only where the bar goes. */}
      <div className="font-mono text-label text-text-faint">
        {standing.scale !== null && <p className="mt-3">{BAR_NOTE}</p>}
        <StandingQuotaNote />
      </div>
    </div>
  );
}
