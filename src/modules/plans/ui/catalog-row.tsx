"use client";

import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { TechnologyMark } from "@/modules/catalog/ui";
import type { CatalogLayout } from "../domain/catalog-view";
import type { PickerTechnology } from "../domain/picker";
import { FollowRejectionNote } from "./follow-rejection-note";
import { FollowToggle } from "./follow-toggle";
import { useFollows } from "./follows-provider";
import { SelectionMark } from "./selection-mark";

// DESIGN.md, Catalog Row: two lines, so the facts sit under the name instead of across a run of
// empty width. The one-line row this replaces put the facts in a 674px cell holding about 400px of
// text, with the button at the right edge: about 270px of empty run in every row of the page. The
// button keeps the right edge, where every row's one action is.
const CELL = "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4";

// Read down, the row is separated by the 1px rule it has always had.
const ROW = `${CELL} items-center gap-y-[2px] border-b border-rule py-3 first:border-t`;
// Read across, the same cells are closed by the same hairline instead of sitting over one: a grid of
// rules is a sawtooth of loose lines, and the outline is that line finished (DESIGN.md, Catalog
// Layout). No fill, no shadow, no second border: it is not a card.
const PANEL = `${CELL} h-full content-start items-start gap-y-2 rounded-md border border-rule p-4`;

export function CatalogRow({
  technology,
  hidden,
  layout = "rows",
  date = false,
}: {
  technology: PickerTechnology;
  hidden: boolean;
  layout?: CatalogLayout;
  // The date is printed only while the list is ordered by it: a fact doing no work on the page is
  // one more thing to read (DESIGN.md, Catalog Ordering).
  date?: boolean;
}) {
  const t = useTranslator();
  const follows = useFollows();
  const rejection = follows.rejectionOn(technology.id);
  const errorId = `err-${technology.slug}`;
  const grid = layout === "grid";

  return (
    <li className={grid ? PANEL : ROW} hidden={hidden}>
      <span className="flex min-w-0 items-center gap-2">
        {/* Only while the mode is on, and in the first cell rather than in a column of its own: a
            column added to the grid would change the width of every row the moment the mode is
            switched on (DESIGN.md, Select Many). */}
        <SelectionMark technologyId={technology.id} name={technology.name} />
        <TechnologyMark slug={technology.slug} />
        <Link
          href={`/technologies/${technology.slug}`}
          className="font-sans text-body leading-[1.45] font-semibold tracking-[-0.01em] text-text no-underline hover:underline hover:decoration-current"
        >
          {technology.name}
        </Link>
      </span>
      {/* Down the page the button spans both lines, because the facts run beside it; across, the
          facts take the whole cell under it, so it keeps the first line alone. */}
      <span
        className={
          grid ? "col-start-2 row-start-1" : "col-start-2 row-span-2 row-start-1 self-center"
        }
      >
        <FollowToggle
          technologyId={technology.id}
          name={technology.name}
          errorId={rejection ? errorId : undefined}
        />
      </span>
      {/* Down the page the facts are one line, where the dot is the only thing that can separate
          them. Inside a panel there is a line to spare, so the description takes it and the dot goes
          with the run-on: `·` earns its place between facts on one line, not between lines
          (DESIGN.md, Catalog Row). */}
      <span
        className={`row-start-2 font-mono text-label leading-[1.6] text-text-faint tabular-nums ${
          grid ? "col-start-1 col-end-[-1]" : "col-start-1"
        }`}
      >
        {technology.latest && (
          <span className={grid ? "block" : undefined}>
            {/* The version kept its own ink by being an element inside the sentence, which a
                message cannot be: the line is one sentence now (ADR 0008). */}
            {date && technology.latestAt
              ? t("stack.catalog.latestOn", { version: technology.latest, date: technology.latestAt })
              : t("stack.catalog.latest", { version: technology.latest })}
            {!grid && " · "}
          </span>
        )}
        {technology.description}
      </span>
      {rejection && <FollowRejectionNote id={errorId} rejection={rejection} className={ERROR_LINE} />}
    </li>
  );
}

// DESIGN.md, Row Error Line: a third line spanning the whole row, under the facts.
const ERROR_LINE = "col-start-1 col-end-[-1] row-start-3 mt-2";
