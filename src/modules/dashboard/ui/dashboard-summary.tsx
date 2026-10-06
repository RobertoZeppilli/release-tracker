import Link from "next/link";
import { SeverityLabel } from "@/modules/releases/ui";
import type { DashboardCounts, DashboardVerdict, InUseTotals } from "../domain/build-dashboard";
import {
  type CountRow,
  type FactRow,
  inUseCaption,
  inUseRows,
  pageVerdict,
  windowCaption,
  windowRows,
} from "./dashboard-copy";

const BOX = "rounded-md border border-rule bg-raised px-4 py-3";
const CAPTION = "font-mono text-meta text-text-faint";
const ROW = "flex items-baseline justify-between gap-4 py-1 font-mono text-label text-text-muted tabular-nums";

// The window counts and the Version in use, each in its own box: a label on the left and its number
// on the right, so the numbers line up in a column instead of being carried by a sentence that wraps
// in the middle of them on a phone (DESIGN.md, Count Box). Every count still links to its section,
// and only to a section that exists: a count of zero has no section to point at, so its row stays
// plain text instead of becoming a dead anchor.
export function DashboardSummary({
  verdict,
  counts,
  inUse,
}: {
  verdict: DashboardVerdict | null;
  counts: DashboardCounts;
  inUse: InUseTotals | null;
}) {
  const { tone, label, claim } = pageVerdict(verdict);

  return (
    <section aria-labelledby="page-verdict">
      <p id="page-verdict" className="font-mono text-verdict">
        <SeverityLabel tone={tone} label={label} /> {claim}
      </p>
      {/* Two columns above 640px even when only the window box is there: the box keeps its half
          of the measure, so declaring a Version in use adds a box beside it instead of halving one. */}
      <div className="mt-4 grid max-w-measure gap-4 sm:grid-cols-2">
        <Box caption={windowCaption(counts.technologies)} testId="window-counts">
          {windowRows(counts).map((row) => (
            <CountItem key={row.key} row={row} />
          ))}
        </Box>
        {/* Only for whoever declared a Version in use, and the box is as muted as the other: the
            distance is a count, and the one inked line on the page is the verdict above it. */}
        {inUse && (
          <Box caption={inUseCaption(inUse, counts.technologies)} testId="in-use-counts">
            {inUseRows(inUse).map((row) => (
              <FactItem key={row.label} row={row} />
            ))}
          </Box>
        )}
      </div>
    </section>
  );
}

function Box({ caption, children, testId }: { caption: string; children: React.ReactNode; testId: string }) {
  return (
    <div className={BOX} data-testid={testId}>
      <p className={CAPTION}>{caption}</p>
      <ul className="mt-2">{children}</ul>
    </div>
  );
}

function Label({ row }: { row: CountRow }) {
  return (
    <span>
      {row.label}
      {row.note && (
        <>
          {" ("}
          <span className="text-text">{row.note.value}</span> {row.note.words}
          {")"}
        </>
      )}
    </span>
  );
}

// The whole row is the link, not the number alone: on a phone a two-character target is not one.
function CountItem({ row }: { row: CountRow }) {
  if (!row.linked)
    return (
      <li className={ROW}>
        <Label row={row} />
        <span className="text-text">{row.value}</span>
      </li>
    );

  return (
    <li>
      <Link href={row.href} className={`${ROW} group no-underline`}>
        <span className="group-hover:text-text">
          <Label row={row} />
        </span>
        <span className="text-text group-hover:underline">{row.value}</span>
      </Link>
    </li>
  );
}

function FactItem({ row }: { row: FactRow }) {
  return (
    <li className={ROW}>
      <span>{row.label}</span>
      <span className="text-text">{row.value}</span>
    </li>
  );
}
