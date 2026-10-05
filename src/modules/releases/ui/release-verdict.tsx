import type { SummarizedRelease } from "../domain/upgrade-path";
import { plural } from "./release-rows";
import { SeverityLabel } from "./severity-label";

// One line per featured or notable Release row: its verdict, or why there is none yet.
export function ReleaseVerdict({ release }: { release: SummarizedRelease }) {
  return <p className="mt-[2px] font-mono text-label">{content(release)}</p>;
}

function content({ actionRequired, unjudged, summaryStatus, summary }: SummarizedRelease) {
  // DESIGN.md, Release Row: an action row says how many breaking changes it carries, so the count
  // is read on the row instead of on the Release page.
  if (actionRequired === true) {
    const count = summary ? ` · ${plural(summary.breakingChanges.length, "breaking change")}` : "";
    return <SeverityLabel tone="action" label={`warning: action required${count}`} />;
  }
  if (actionRequired === false) return <SeverityLabel tone="ok" label="ok: safe to upgrade" />;
  // There is a Summary here, and the row says so: what it has not got is a verdict.
  if (unjudged) return <SeverityLabel tone="muted" label="note: not enough notes to judge" />;
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
