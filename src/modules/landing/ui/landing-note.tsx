import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Glyph } from "@/modules/summaries/ui";

// DESIGN.md, Counter-Position Note: a `note:` line in `text-muted` with the info glyph, then Grotesk
// prose at the measure. It is the shape every withdrawal in this product already has, so the landing
// says what it is not in the same register it says "there is nothing here to judge".
// Uninked on purpose: `note:` lines never take a severity hue (The Severity-Only Colour Rule).
export function LandingNote({ claim, children }: { claim: string; children: ReactNode }) {
  return (
    <div className="mt-5 max-w-measure">
      <p className="mb-3 font-mono text-diagnostic text-text-muted">
        <Glyph Icon={Info} />
        note: {claim}
      </p>
      <p className="font-sans text-body text-text-muted">{children}</p>
    </div>
  );
}

// The landing's own section title: Mono 13px, the whole line muted, with the rule running to the
// edge. The Dashboard's version lifts the words to `text` at body size, which it can because its
// titles carry counts a reader scans for; here the titles are only joints in an argument.
export function LandingSectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-8 mb-4 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']"
    >
      {children}
    </h2>
  );
}
