"use client";

import { useCatalogSelection } from "./catalog-selection";

// DESIGN.md, Select Many: the mark is typographic, `[ ]` and `[x]` in the page's own mono voice,
// and not a checkbox the browser draws. Both states are two characters wide, so choosing a row
// moves nothing beside it. The padding is what carries the 24px target (SC 2.5.8), not the glyph.
export function SelectionMark({ technologyId, name }: { technologyId: string; name: string }) {
  const selection = useCatalogSelection();
  if (!selection.on) return null;
  const selected = selection.isSelected(technologyId);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`Select ${name}`}
      onClick={() => selection.select(technologyId)}
      className={`-my-1 -ml-1 shrink-0 rounded-[3px] px-1 py-1 font-mono text-body tabular-nums ${
        selected ? "text-text" : "text-text-faint hover:text-text-muted"
      }`}
    >
      {selected ? "[x]" : "[ ]"}
    </button>
  );
}
