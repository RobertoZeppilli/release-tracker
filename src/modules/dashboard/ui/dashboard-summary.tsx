import Link from "next/link";
import { SeverityLabel } from "@/modules/releases/ui";
import type { DashboardCounts, DashboardVerdict } from "../domain/build-dashboard";
import { pageVerdict } from "./dashboard-copy";

// Only `featured` has a section on this page: the other three numbers are real, but their sections
// arrive with the Weekly Digest slice, and a link to an anchor that does not exist is a dead end.
export function DashboardSummary({ verdict, counts }: { verdict: DashboardVerdict; counts: DashboardCounts }) {
  const { tone, label, claim } = pageVerdict(verdict);

  return (
    <section aria-labelledby="page-verdict">
      <p id="page-verdict" className="font-mono text-verdict">
        <SeverityLabel tone={tone} label={label} /> {claim}
      </p>
      <p className="mt-3 font-mono text-diagnostic text-text-muted tabular-nums">
        Last 30 days across <Count value={counts.technologies} /> {counts.technologies === 1 ? "technology" : "technologies"}:{" "}
        <Link href="#spotlight" className="text-text-muted decoration-rule-strong hover:text-text hover:decoration-current">
          <Count value={counts.featured} /> featured
        </Link>
        {verdict.needsAction > 0 && (
          <>
            {" ("}
            <Count value={verdict.needsAction} /> {verdict.needsAction === 1 ? "needs" : "need"} action{")"}
          </>
        )}
        , <Count value={counts.notable} /> notable, <Count value={counts.previews} /> previews,{" "}
        <Count value={counts.digest} /> digest.
      </p>
    </section>
  );
}

function Count({ value }: { value: number }) {
  return <span className="text-text">{value}</span>;
}
