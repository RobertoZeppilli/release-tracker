import Link from "next/link";
import { releasePath } from "../domain/release-page";
import { rowVerdict, type RowVerdict } from "../domain/row-verdict";
import type { SummarizedRelease } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";

// One line per featured or notable Release row: its verdict, or why there is none yet. What it says
// comes from `rowVerdict` in the domain, the one answer the Dashboard reads too.
export function ReleaseVerdict({ slug, release }: { slug: string; release: SummarizedRelease }) {
  return (
    <p className="mt-[2px] font-mono text-label">
      <RowVerdictLine verdict={rowVerdict(release)} href={releasePath(slug, release.version)} />
    </p>
  );
}

// DESIGN.md, Neutral row verdicts: a neutral status is followed by `read the release notes` as an
// underlined link, and nothing follows it where there are none to read. It carries the label
// treatment of the Help Pointer -- interactive green, 1px dashed underline, solid on hover -- and
// not `text-muted` alone: muted beside the row's own `text` measured 2.1:1, and a link inside a
// sentence has to be told apart from it without colour (WCAG 1.4.1, axe `link-in-text-block`).
//
// ⚠️ The link takes a line of its own, and the `·` that introduced it is gone with it. On the line
// it used to share, the four words broke wherever the column ran out -- `read` on one line and `the
// release notes` on the next, a different place at every width -- so what the reader saw split was
// the link itself. A `·` separates facts on one line and never two lines (DESIGN.md, Upgrade Panel),
// so once the link is a line there is nothing for it to separate.
export function RowVerdictLine({ verdict, href }: { verdict: RowVerdict; href: string }) {
  return (
    <>
      <SeverityLabel tone={verdict.tone} label={verdict.label} pending={verdict.pending} />{" "}
      <span className={verdict.tone === "muted" ? "text-text-muted" : undefined}>{verdict.claim}</span>
      {verdict.notes && (
        <Link
          href={href}
          className="mt-[2px] block w-fit border-b border-dashed border-current text-link no-underline hover:border-solid"
        >
          read the release notes
        </Link>
      )}
    </>
  );
}
