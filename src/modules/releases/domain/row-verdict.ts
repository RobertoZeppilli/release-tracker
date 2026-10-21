import type { Translator } from "@/modules/i18n";
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

// It takes `t` since ADR 0008: what a row says is a sentence in the dictionary, and what this
// function decides is which sentence. The labels are the product's grammar and stay as written.
export function rowVerdict(
  { actionRequired, unjudged, summaryStatus, summary }: Row,
  t: Translator,
): RowVerdict {
  // DESIGN.md, Release Row: an action row says how many breaking changes it carries, so the count is
  // read on the row instead of on the Release page.
  if (actionRequired === true) {
    const claim = summary
      ? t("release.verdict.actionCount", { count: summary.breakingChanges.length })
      : t("release.verdict.action");
    return { tone: "action", label: "warning:", claim, notes: false };
  }
  if (actionRequired === false)
    return { tone: "ok", label: "ok:", claim: t("release.verdict.safe"), notes: false };
  // There is a Summary here, and the row says so: what it has not got is a verdict. The paragraph
  // that explains it belongs to the Release page, not to a row.
  if (unjudged)
    return { tone: "muted", label: "note:", claim: t("release.verdict.unjudged"), notes: false };

  switch (summaryStatus) {
    case "pending":
    case "processing":
      return { tone: "muted", label: "pending:", claim: t("release.status.queued"), pending: true, notes: true };
    case "skipped":
      return { tone: "muted", label: "note:", claim: t("release.status.older"), notes: true };
    // No notes, no Summary, and nothing to point at: the row says what is missing and stops there.
    case "unavailable":
      return { tone: "muted", label: "note:", claim: t("release.status.unavailable"), notes: false };
    case "failed":
      return { tone: "muted", label: "note:", claim: t("release.status.failed"), notes: true };
    default:
      return { tone: "muted", label: "note:", claim: t("release.status.none"), notes: true };
  }
}
