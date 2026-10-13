import Link from "next/link";
import { releasePath, rowVerdict, type Significance } from "@/modules/releases";
import { BreakingList, RowVerdictLine, SignificanceGlyph } from "@/modules/releases/ui";
import { HelpPointer } from "@/components/help-pointer";
import { InlineCode } from "@/modules/summaries/ui";
import type { DashboardRow } from "../domain/followed";
import { declarationNote } from "./dashboard-copy";

// DESIGN.md, The Neutral Significance Rule: the shape says the rank and never the severity, so it
// stays in the text inks whatever the verdict one line below says. The severity is already on the
// row, with a glyph of its own and its label word beside it.
const SIGNIFICANCE_INK: Record<Significance, string> = {
  featured: "text-text",
  notable: "text-text-muted",
  digest: "text-text-muted",
  preview: "text-rule-strong",
};

// One Release of the Stream: the Release Row's content with the Technology named, because the
// stream mixes Technologies (DESIGN.md, Stream Row). It takes no hover: it is a block of text with
// links inside it, and a surface under a paragraph says the paragraph can be clicked.
export function StreamEvent({ technology, release }: DashboardRow) {
  const verdict = rowVerdict(release);
  const href = releasePath(release.slug, release.version);
  const breaking = release.summary?.breakingChanges ?? [];
  const declaration = declarationNote(technology, release);

  return (
    <article className="[&+&]:mt-5 [&+&]:border-t [&+&]:border-rule [&+&]:pt-5">
      <p className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center ${SIGNIFICANCE_INK[release.significance]}`}>
          <SignificanceGlyph significance={release.significance} />
          <span className="sr-only">{release.significance}</span>
        </span>
        <span className="text-[1.1rem] leading-[1.3] font-medium tracking-[-0.01em] text-text">
          {technology.name}
        </span>
        <Link href={href} className="font-mono text-body text-text-muted no-underline hover:underline">
          {release.version}
        </Link>
      </p>

      {release.summary && (
        <p className="mt-2 max-w-measure text-body leading-[1.45] font-medium">
          <InlineCode text={release.summary.title} />
        </p>
      )}

      <p className="mt-2 font-mono text-label">
        <RowVerdictLine verdict={verdict} href={href} />
        {/* The one fact that is about this Release and not about a set: it cites the declaration
            instead of counting from it, because the count belongs to the Standing. */}
        {declaration && <span className="text-text-faint"> · {declaration}</span>}
      </p>

      {breaking.length > 0 && (
        <>
          <BreakingList label={`${technology.name} ${release.version}`} changes={breaking} />
          <div className="mt-3">
            <HelpPointer href={href}>
              migrate to {release.slug} {release.version}
            </HelpPointer>
          </div>
        </>
      )}
    </article>
  );
}
