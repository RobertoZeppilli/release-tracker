import { HelpPointer } from "@/components/help-pointer";
import type { PathCounts } from "../domain/upgrade-path";
import { plural } from "./release-rows";
import { SeverityLabel } from "./severity-label";
import { PANEL } from "./upgrade-panel";
import { pathRows, pathSentence, pathVerdict } from "./upgrade-path-copy";

// The verdict of the path, at **Column verdict** scale and not at Verdict scale: inside a 360px
// column the display size wraps over three lines, and the Dashboard already settled this for a
// verdict that sits in a column (DESIGN.md, Verdict Line). It is the second thing the column says
// and not the first, because the counts it claims are built on what the panel above it declares.
//
// It is a panel of the same chrome as the one above it, and it carries its own title instead of a
// caption: the verdict is what this box is called, so a caption over it would name it twice.
//
// What the counts say used to be one sentence, and a reader counting what they face had to read
// prose to find the numbers again. They are figures in a column now, laid out exactly as the
// Standing Panel lays its totals out (DESIGN.md, The Standing Panel): the name on the left, the
// figure right-aligned and tabular on the right, so the numbers of both pages line up on their last
// digit and a reader who learns one panel can read the other.
const ROWS = "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 font-mono text-label text-text-faint";
const FIGURE = "m-0 text-right text-text tabular-nums";

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
  const rows = pathRows(from, to, counts);

  return (
    <section aria-labelledby="path-verdict" className={`mt-5 ${PANEL}`}>
      {/* ⚠️ It wraps, where the same line used to be `whitespace-nowrap`: outside a box a long claim
          could bleed into the gutter beside the column and nobody saw it, and `note: 4 without a
          verdict` printed 16px past the panel's own border the moment it had one. */}
      <p id="path-verdict" className="font-mono text-column-verdict tabular-nums">
        <SeverityLabel tone={verdict.tone} label={verdict.label} /> {verdict.claim}
      </p>
      {/* A path with nothing in it has no counts to lay out, and the one thing worth saying there is
          a sentence (DESIGN.md, Path Panel). */}
      {rows.length === 0 ? (
        <p className="mt-3 font-mono text-label text-text-faint">{pathSentence(from, to, counts)}</p>
      ) : (
        <dl className={`mt-3 ${ROWS}`}>
          {rows.map((row) => (
            <div className="col-span-2 grid grid-cols-subgrid" key={row.words}>
              <dt>{row.words}</dt>
              <dd className={FIGURE}>{row.count}</dd>
            </div>
          ))}
        </dl>
      )}
      {showAll && (
        <p className="mt-3 font-mono text-label">
          <HelpPointer href={showAll.href}>show all {plural(showAll.total, "release")}</HelpPointer>
        </p>
      )}
    </section>
  );
}
