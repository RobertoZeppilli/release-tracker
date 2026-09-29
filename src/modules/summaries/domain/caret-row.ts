// The caret row under a quote is `^` repeated once per cited character, so it only reads right while
// the quote stays on one line: once the quote wraps, the carets sit under the wrong words, and being
// one run with no place to break they widen the whole page (issue #62). Where the caret row cannot be
// shown, DESIGN.md already has the replacement: a coral underline inside the quote row itself.
//
// Whether a quote wraps depends on the viewport, so what is computed here is the narrowest viewport
// where a quote of a given length still fits on one line. The page hides the caret row below it.

// Fragment Mono advances 9px at the 14px of the diagnostic row. It is measured on the live font, not
// derived from a nominal 0.6em: the first guess was 8.4px, and the 0.6px it was short by let quotes of
// exactly the width of a step through, which is how three pages still overflowed after the first fix.
const CHAR = 9;
// The `5ch` gutter of the quote grid plus the `pr-3` the quote text keeps on its right.
const GUTTER = 5 * CHAR + 12;
// One character of slack, so a quote that lands exactly on a step does not depend on sub-pixel luck.
const MARGIN = 1;

// The content column is 1040px at most with 24px of padding a side, and diagnostics stop at 900px.
function column(viewport: number): number {
  return Math.min(900, Math.min(1040, viewport) - 48);
}

// The widths the caret row is switched at. Below 641px caret rows do not exist at all, and above
// 1024px the column has already reached its 900px cap, so nothing wider would change the answer.
export const CARET_WIDTHS = [641, 768, 900, 1024] as const;
export type CaretWidth = (typeof CARET_WIDTHS)[number];

// `null` when the quote never fits on one line and the underline carries the citation at every width.
export function caretWidth(length: number): CaretWidth | null {
  return CARET_WIDTHS.find((width) => length <= fits(width)) ?? null;
}

// How many characters of quote the diagnostic column holds on one line at that width.
export function fits(width: CaretWidth): number {
  return Math.floor((column(width) - GUTTER) / CHAR) - MARGIN;
}
