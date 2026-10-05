import Link from "next/link";
import { SeverityLabel } from "@/modules/releases/ui";
import type { DashboardCounts, DashboardVerdict, InUseTotals } from "../domain/build-dashboard";
import { inUseTotalsLine, pageVerdict } from "./dashboard-copy";

// Every number is a link to its own section, and only to a section that exists: a count of zero
// has no section to point at, so it stays plain text instead of becoming a dead anchor.
export function DashboardSummary({
  verdict,
  counts,
  inUse,
}: {
  verdict: DashboardVerdict;
  counts: DashboardCounts;
  inUse: InUseTotals | null;
}) {
  const { tone, label, claim } = pageVerdict(verdict);

  return (
    <section aria-labelledby="page-verdict">
      <p id="page-verdict" className="font-mono text-verdict">
        <SeverityLabel tone={tone} label={label} /> {claim}
      </p>
      <p className="mt-3 max-w-measure font-mono text-diagnostic text-text-muted tabular-nums">
        Last 30 days across <Count value={counts.technologies} /> {counts.technologies === 1 ? "technology" : "technologies"}:{" "}
        <CountLink value={counts.featured} href="#spotlight" label="featured" exists />
        {verdict.needsAction > 0 && (
          <>
            {" ("}
            <Count value={verdict.needsAction} /> {verdict.needsAction === 1 ? "needs" : "need"} action{")"}
          </>
        )}
        , <CountLink value={counts.notable} href="#latest" label="notable" />,{" "}
        <CountLink value={counts.previews} href="#previews" label="previews" />,{" "}
        <CountLink value={counts.digest} href="#digest" label="digest" />.
      </p>
      {/* Only for whoever declared a Version in use, and it stays muted: the distance is a count, and
          the one inked line on the page is the verdict above it. */}
      {inUse && (
        <p className="mt-2 max-w-measure font-mono text-diagnostic text-text-muted tabular-nums">
          {inUseTotalsLine(inUse, counts.technologies)}
        </p>
      )}
    </section>
  );
}

function Count({ value }: { value: number }) {
  return <span className="text-text">{value}</span>;
}

// Spotlight is there even with nothing featured, because it lists every followed Technology; the
// other three sections only exist when they have rows.
function CountLink({ value, href, label, exists = value > 0 }: { value: number; href: string; label: string; exists?: boolean }) {
  if (!exists)
    return (
      <>
        <Count value={value} /> {label}
      </>
    );

  return (
    <Link href={href} className="text-text-muted decoration-rule-strong hover:text-text hover:decoration-current">
      <Count value={value} /> {label}
    </Link>
  );
}
