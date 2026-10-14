import { HelpPointer } from "@/components/help-pointer";
import type { PathCounts } from "../domain/upgrade-path";
import { plural } from "./release-rows";
import { SeverityLabel } from "./severity-label";
import { pathSentence, pathVerdict } from "./upgrade-path-copy";

// The verdict of the path, at **Column verdict** scale and not at Verdict scale: inside a 360px
// column the display size wraps over three lines, and the Dashboard already settled this for a
// verdict that sits in a column (DESIGN.md, Verdict Line). It is the second thing the column says
// and not the first, because the counts it claims are built on what the panel above it declares.
//
// The sentence under it counts the whole path, which is the one thing no row of the list counts: the
// groups on the right count themselves, and their sum is this.
export function UpgradeVerdict({
  from,
  to,
  counts,
  showAll,
}: {
  from: string;
  to: string;
  counts: PathCounts;
  // The way back to the whole recorded history, when the path hides some of it. It sits with the
  // path and not under the list, because it is the control that empties the `from` field.
  showAll: { href: string; total: number } | null;
}) {
  const verdict = pathVerdict(counts);

  return (
    <div className="mt-5">
      <p
        id="path-verdict"
        className="font-mono text-column-verdict tabular-nums whitespace-nowrap stacked:whitespace-normal"
      >
        <SeverityLabel tone={verdict.tone} label={verdict.label} /> {verdict.claim}
      </p>
      <p className="mt-3 font-mono text-diagnostic text-text-muted stacked:max-w-measure">
        {pathSentence(from, to, counts)}
      </p>
      {showAll && (
        <p className="mt-5">
          <HelpPointer href={showAll.href}>show all {plural(showAll.total, "release")}</HelpPointer>
        </p>
      )}
    </div>
  );
}
