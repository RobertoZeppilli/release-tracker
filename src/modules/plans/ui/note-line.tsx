"use client";

import { Info } from "lucide-react";

// DESIGN.md, Note Lines: an uninked `note:` at The One Error Measure's own scale, with the info
// glyph. It says a fact about the page and carries no ink, because a boundary is not a failure.
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 max-w-[900px] font-mono text-diagnostic text-text-muted">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: {children}
    </p>
  );
}
