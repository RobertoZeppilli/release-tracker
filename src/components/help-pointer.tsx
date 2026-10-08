import Link from "next/link";
import type { ReactNode } from "react";

// DESIGN.md, Help Pointer Link: a faint `-->`, then the lowercase label in `help` with a 1px dashed
// underline that turns solid on hover. Only the label carries the underline.
export function HelpPointer({ href, children }: { href: string; children: ReactNode }) {
  return <Pointer href={href} arrow="-->" label={children} />;
}

// The same link turned around, for the second leg of a round trip: the arrow reversed, nothing else.
// A reader who followed a `-->` out of a reading owes nothing to learn to come back.
export function BackPointer({ href, children }: { href: string; children: ReactNode }) {
  return <Pointer href={href} arrow="<--" label={children} />;
}

function Pointer({ href, arrow, label }: { href: string; arrow: string; label: ReactNode }) {
  // An absolute href leaves the app, and `Link` has no prefetch or client navigation to offer for it.
  const Tag = href.startsWith("http") ? "a" : Link;
  return (
    <Tag href={href} className="font-mono text-label no-underline">
      <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
        {arrow}
      </span>
      <span className="border-b border-dashed border-current text-help hover:border-solid">{label}</span>
    </Tag>
  );
}
