import Link from "next/link";
import type { ReactNode } from "react";

// DESIGN.md, Help Pointer Link: a faint `-->`, then the lowercase label in `help` with a 1px dashed
// underline that turns solid on hover. Only the label carries the underline.
export function HelpPointer({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-mono text-label no-underline">
      <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
        --&gt;
      </span>
      <span className="border-b border-dashed border-current text-help hover:border-solid">{children}</span>
    </Link>
  );
}
