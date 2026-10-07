import type { ReactNode } from "react";
import type { Significance } from "../domain/significance";

// DESIGN.md, Neutral Significance Rule: a shape on a 12-unit grid, never a hue.
const SHAPES: Record<Significance, ReactNode> = {
  featured: <path d="M6 1 11 6 6 11 1 6Z" fill="currentColor" />,
  notable: <path d="M6 1.7 10.3 6 6 10.3 1.7 6Z" fill="none" stroke="currentColor" strokeWidth="1.5" />,
  digest: <circle cx="6" cy="6" r="2" fill="currentColor" />,
  preview: (
    <path d="M6 1.7 10.3 6 6 10.3 1.7 6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.6" />
  ),
};

// The shape alone, for the one place that maps shapes to words instead of labelling a row: the Stat
// Row legend, which pairs it with the fill it stands for.
export function SignificanceGlyph({ significance }: { significance: Significance }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3 flex-none" aria-hidden>
      {SHAPES[significance]}
    </svg>
  );
}

// `labelHidden` keeps the word for assistive technology and shows the shape alone: on a section
// where every row carries the same Significance, repeating the word on each line is noise.
export function SignificanceLabel({
  significance,
  labelHidden = false,
}: {
  significance: Significance;
  labelHidden?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-[6px] font-mono text-label text-text-muted">
      <SignificanceGlyph significance={significance} />
      <span className={labelHidden ? "sr-only" : undefined}>{significance}</span>
    </span>
  );
}
