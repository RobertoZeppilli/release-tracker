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

// DESIGN.md, Neutral row verdicts: a neutral status is followed by `· read the release notes` as an
// underlined link, and nothing follows it where there are none to read.
export function RowVerdictLine({ verdict, href }: { verdict: RowVerdict; href: string }) {
  return (
    <>
      <SeverityLabel tone={verdict.tone} label={verdict.label} pending={verdict.pending} />{" "}
      <span className={verdict.tone === "muted" ? "text-text-muted" : undefined}>{verdict.claim}</span>
      {verdict.notes && (
        <>
          <span className="text-text-muted"> · </span>
          <Link href={href} className="text-text-muted decoration-rule-strong hover:text-text hover:decoration-current">
            read the release notes
          </Link>
        </>
      )}
    </>
  );
}
