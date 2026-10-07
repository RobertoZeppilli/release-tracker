import type { ReactNode } from "react";

// One panel holds everything between the header and the first Release: the two controls and the
// facts they work on, as rows of label and value (DESIGN.md, Upgrade Panel). The treatment is the
// Dashboard's Count Box, with one difference that the controls force: the value column is
// left-aligned behind a short label column instead of being pushed to the right edge, because two of
// these values are a field and its buttons, not a number.
const PANEL = "mt-6 max-w-measure rounded-md border border-rule bg-raised px-4 py-3";
const CAPTION = "m-0 font-mono text-meta text-text-faint";

// Every row of the panel shares one grid, so the fields and the facts line up on one left edge. The
// column is 9ch, the width of the longest label the panel has now that `Version in use` has become
// `in use`: the old 14ch was that sentence's width, and keeping it would be 5 characters of air
// between every label and its value. The column holds at every width, phones included: 9ch is 81px,
// and a label of its own line above each field would make the panel two rows taller there than
// letting `Clear` wrap under its field.
export const PANEL_ROW_CLASS =
  "m-0 grid grid-cols-[9ch_1fr] items-baseline gap-x-3 gap-y-2 font-mono text-diagnostic text-text-muted";

// What a row's value cell holds when it is a control rather than a word: the field and its buttons,
// wrapping together. The row aligns on the baseline rather than on the centre, so that a cell that
// wraps on a phone keeps its label beside the field and not beside the button under it.
export const PANEL_CELL_CLASS = "flex flex-wrap items-center gap-3";

// A line that belongs to the row above it and not to a label of its own: the day of a declaration,
// a note, an error. It keeps the value column so it reads as a continuation of the value, and the
// empty first cell is what indents it. Below 640px it gives that indent up and takes the width
// instead: a sentence in a column 9ch narrower than the panel wraps a line more for nothing.
export const PANEL_NOTE_CLASS = `${PANEL_ROW_CLASS} max-[640px]:grid-cols-1`;

export function PanelNoteRow({ children }: { children: ReactNode }) {
  return (
    <p className={PANEL_NOTE_CLASS}>
      <span aria-hidden className="max-[640px]:hidden" />
      <span>{children}</span>
    </p>
  );
}

// `latest` is the destination of the path, so it is a row here instead of the `to 6.0.3` that used
// to sit inside the control: a fact the reader can look up, not a word in a sentence.
export function UpgradePanel({ latest, children }: { latest: string; children: ReactNode }) {
  return (
    <section aria-labelledby="upgrade-panel" className={PANEL}>
      <p id="upgrade-panel" className={CAPTION}>
        upgrade path
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {children}
        <p className={PANEL_ROW_CLASS}>
          <span>latest</span>
          <span className="text-text">{latest}</span>
        </p>
      </div>
    </section>
  );
}
