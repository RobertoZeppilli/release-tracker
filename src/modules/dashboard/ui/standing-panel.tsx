import { SeverityLabel } from "@/modules/releases/ui";
import type { Standing } from "../domain/standing";
import type { Verdict } from "./dashboard-copy";
import { BAR_NOTE, NO_TOTALS, totalsRows } from "./dashboard-copy";
import { StandingQuotaNote } from "./quota-note";

// DESIGN.md, Standing Panel: the head of the Standing column, on the one raised surface the system
// has. It holds the verdict and the totals of the list under it, as figures in a column instead of
// one sentence that wrapped over three lines: the numbers are what a reader comes back to this
// column for, and a wrapped sentence hides them in prose.
//
// The verdict is the panel's title, where a caption used to say `where your stack stands · by
// distance`: the verdict already names what the column is about, and a caption over it named the
// same thing a second time, in words a reader had to read before reaching the one that counted.
export function StandingPanel({ standing, verdict }: { standing: Standing; verdict: Verdict }) {
  const rows = totalsRows(standing);

  return (
    <div className="mb-5 rounded-md border border-rule bg-raised p-4">
      <p id="page-verdict" className="mb-3 font-mono text-column-verdict tabular-nums">
        <SeverityLabel tone={verdict.tone} label={verdict.label} /> {verdict.claim}
      </p>

      {/* A panel with nothing to count says so, as the Path Panel does with its sentence: a title
          alone over an empty box reads as a panel that failed to load (DESIGN.md, Standing Panel). */}
      {rows.length === 0 && (
        <p className="font-mono text-label text-text-faint">{NO_TOTALS}</p>
      )}

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
