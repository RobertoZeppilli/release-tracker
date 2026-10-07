import type { SummaryContent } from "@/modules/summaries";
import type { SummaryStatus } from "./initial-summary-status";

export type Tone = "action" | "ok" | "muted" | "breaking";

// What one Release row says about itself, on whichever surface the row appears. The Dashboard and
// the Technology page used to answer this twice, in two vocabularies, and the Dashboard's collapsed
// one told the reader to read notes that a Release with `unavailable` has not got: a Release reads
// the same way wherever it is printed, so the answer is one function and the surfaces only render it.
export type RowVerdict = {
  tone: Tone;
  label: string;
  claim: string;
  // The clock glyph instead of the tone's own: a Summary on its way is not a state of the Release.
  pending?: true;
  // Whether the row offers the Release Notes as a link (DESIGN.md, Neutral row verdicts). False
  // where there are none to offer, which is what `unavailable` means (`initialSummaryStatus`).
  notes: boolean;
};

type Row = {
  actionRequired: boolean | null;
  unjudged: boolean;
  summaryStatus: SummaryStatus | null;
  summary: SummaryContent | null;
};

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function rowVerdict({ actionRequired, unjudged, summaryStatus, summary }: Row): RowVerdict {
  // DESIGN.md, Release Row: an action row says how many breaking changes it carries, so the count is
  // read on the row instead of on the Release page.
  if (actionRequired === true) {
    const count = summary ? ` · ${plural(summary.breakingChanges.length, "breaking change")}` : "";
    return { tone: "action", label: "warning:", claim: `action required${count}`, notes: false };
  }
  if (actionRequired === false) return { tone: "ok", label: "ok:", claim: "safe to upgrade", notes: false };
  // There is a Summary here, and the row says so: what it has not got is a verdict. The paragraph
  // that explains it belongs to the Release page, not to a row.
  if (unjudged) return { tone: "muted", label: "note:", claim: "not enough notes to judge", notes: false };

  switch (summaryStatus) {
    case "pending":
    case "processing":
      return { tone: "muted", label: "pending:", claim: "summary queued", pending: true, notes: true };
    case "skipped":
      return { tone: "muted", label: "note:", claim: "no summary for this older release", notes: true };
    // No notes, no Summary, and nothing to point at: the row says what is missing and stops there.
    case "unavailable":
      return { tone: "muted", label: "note:", claim: "no release notes to summarize", notes: false };
    case "failed":
      return { tone: "muted", label: "note:", claim: "summary unavailable", notes: true };
    default:
      return { tone: "muted", label: "note:", claim: "no summary", notes: true };
  }
}
