import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "./site-header";

// The whole-page counterpart of the Summary states: a Status-scale severity line, one honest
// paragraph and the ways out. The header carries `nav`, as the home page does, so both destinations
// stay one link away at every width (The No Dead End Rule in DESIGN.md): a page that reports
// nothing to read is exactly where a dead end hurts most.
export function DiagnosticPage({
  Icon,
  label,
  claim,
  tone = "muted",
  children,
}: {
  Icon: LucideIcon;
  label: string;
  claim: string;
  tone?: "muted" | "breaking";
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader nav />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-mono text-status">
          <span className={tone === "breaking" ? "text-breaking" : "text-text-muted"}>
            <Icon aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
            {label}
          </span>{" "}
          {/* The claim wraps as a unit under the label: The One-Line Verdict Rule. */}
          <span className="inline-block">{claim}</span>
        </h1>
        {children}
      </main>
    </>
  );
}

// DESIGN.md, Help Pointer Link: a faint `-->`, then the lowercase label in `help` with a 1px dashed
// underline that turns solid on hover. Only the label carries the underline.
export function HelpPointer({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-mono text-label no-underline">
      <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
        --&gt;
      </span>
      <span className="border-b border-dashed border-current text-help hover:border-solid">{children}</span>
    </Link>
  );
}
