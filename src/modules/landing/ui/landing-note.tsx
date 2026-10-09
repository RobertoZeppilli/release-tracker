import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Glyph } from "@/modules/summaries/ui";

// DESIGN.md, Counter-Position Note: a `note:` line in `text-muted` with the info glyph, then Grotesk
// prose at the measure. It is the shape every withdrawal in this product already has, so the landing
// says what it is not in the same register it says "there is nothing here to judge".
// Uninked on purpose: `note:` lines never take a severity hue (The Severity-Only Colour Rule).
//
// `flush` is for the one that opens a column of its own, where the 24px that separates it from the
// rows above would be a hole at the top of the column instead.
export function LandingNote({ claim, children, flush }: { claim: string; children: ReactNode; flush?: boolean }) {
  return (
    <div className={`max-w-measure ${flush ? "" : "mt-5"}`}>
      <p className="mb-3 font-mono text-diagnostic text-text-muted">
        <Glyph Icon={Info} />
        note: {claim}
      </p>
      <p className="font-sans text-body text-text-muted">{children}</p>
    </div>
  );
}
