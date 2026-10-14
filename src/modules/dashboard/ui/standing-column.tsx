import type { DashboardVerdict } from "../domain/build-dashboard";
import type { Standing } from "../domain/standing";
import { pageVerdict } from "./dashboard-copy";
import { StandingPanel } from "./standing-panel";
import { StandingRow } from "./standing-row";

// The left half of the Dashboard, and the answer to *where does my stack stand* (DESIGN.md,
// Standing Column). Two parts in fixed order: the panel, titled by the verdict and counting the
// whole, then the list, which scrolls inside itself so the panel above it never leaves.
export function StandingColumn({
  verdict,
  standing,
}: {
  verdict: DashboardVerdict | null;
  standing: Standing;
}) {
  // The sticky column lives inside a plain grid item stretched to the row's height: a sticky grid
  // item is not clamped by its own grid area, so the column used to slide past the end of the split
  // and paint over the line under it.
  return (
    <div className="self-stretch">
      <aside
        aria-labelledby="page-verdict"
        className="flex flex-col min-[1041px]:sticky min-[1041px]:top-[72px] min-[1041px]:max-h-[calc(100vh-72px-var(--spacing-6))]"
      >
        {/* The verdict is the title of the panel now, not a line above it: two boxes of the app
          hold a verdict and its counts, and they are the same box (DESIGN.md, Standing Panel). */}
        <StandingPanel standing={standing} verdict={pageVerdict(verdict)} />

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

      </aside>
    </div>
  );
}
