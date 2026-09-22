import type { SummarizedRelease } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";

// One line per featured or notable Release in the Upgrade Path: its verdict, or why there is none yet.
export function ReleaseVerdict({ release }: { release: SummarizedRelease }) {
  return <p className="mt-[2px] font-mono text-label">{content(release)}</p>;
}

function content({ actionRequired, summaryStatus }: SummarizedRelease) {
  if (actionRequired === true) return <SeverityLabel tone="action" label="warning: action required" />;
  if (actionRequired === false) return <SeverityLabel tone="ok" label="ok: safe to upgrade" />;
  switch (summaryStatus) {
    case "pending":
    case "processing":
      return <SeverityLabel tone="muted" pending label="pending: summary queued, check the notes" />;
    case "skipped":
      return <SeverityLabel tone="muted" label="note: no summary for this older release, check the notes" />;
    case "unavailable":
      return <SeverityLabel tone="muted" label="note: no release notes to summarize" />;
    case "failed":
      return <SeverityLabel tone="muted" label="note: summary unavailable, check the notes" />;
    default:
      return <SeverityLabel tone="muted" label="note: no summary, check the notes" />;
  }
}
