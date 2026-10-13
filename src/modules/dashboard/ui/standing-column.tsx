import { SeverityLabel } from "@/modules/releases/ui";
import type { DashboardVerdict } from "../domain/build-dashboard";
import type { Standing } from "../domain/standing";
import { pageVerdict } from "./dashboard-copy";
import { StandingPanel } from "./standing-panel";
import { StandingRow } from "./standing-row";

// The left half of the Dashboard, and the answer to *where does my stack stand* (DESIGN.md,
// Standing Column). Three parts in fixed order: the verdict, the panel that names the column and
// counts the whole, then the list, which scrolls inside itself so the two above it never leave.
export function StandingColumn({
  verdict,
  standing,
}: {
  verdict: DashboardVerdict | null;
  standing: Standing;
}) {
  const { tone, label, claim } = pageVerdict(verdict);

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

        <StandingPanel standing={standing} />

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
