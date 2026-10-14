import Link from "next/link";
import type { ReactNode } from "react";

// DESIGN.md, Help Pointer Link: a faint `-->`, then the lowercase label in the interactive green
// with a 1px dashed underline that turns solid on hover. Only the label carries the underline.
// The green is what separates the two things this arrow used to say in one colour: a pointer that
// leads to another screen of the product is interactive, while a pointer into the release notes
// (`--> release-notes:12-13`) stays `help` cyan, with the wash of the cited line and the `help:`
// remedy line it belongs to (the user's choice of 2026-10-14).
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
    <Tag href={href} className="font-mono text-label leading-[normal] no-underline">
      <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
        {arrow}
      </span>
      <span className="border-b border-dashed border-current text-link hover:border-solid">{label}</span>
    </Tag>
  );
}
