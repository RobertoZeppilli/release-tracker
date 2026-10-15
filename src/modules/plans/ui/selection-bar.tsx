"use client";

import { CircleX, Info } from "lucide-react";
import { groupFollowError, groupWallFor, groupWallNote, wallNow } from "../domain/group-follow";
import { useCatalogSelection } from "./catalog-selection";
import { useFollows } from "./follows-provider";

const GROUP_WALL_ID = "group-wall";

// DESIGN.md, Selection Bar: one line under the Catalog's head, sticky inside the column, with no
// fill and no border. It is the head staying put, not a surface arriving: a selection made at the
// thirty-first row with the action at the first is an accelerator that asks for a scroll back.
export function SelectionBar() {
  const selection = useCatalogSelection();
  const follows = useFollows();
  const chosen = selection.selected.length;
  if (!selection.on || chosen === 0) return null;

  const wall = groupWallFor(chosen, follows.count);
  // A refusal belongs to the group, so the bar says it: a group has no row to carry it, the way a
  // single Follow does. The figure is taken from the follows as they stand now and not from what
  // the page believed before the press, because the press is refused exactly when the two differ:
  // another session filled the Plan, and the provider has re-read it by the time this is drawn.
  const refusal = follows.groupRejection;

  return (
    // ⚠️ `top-[56px]` and not `top-0`: this project turns the default spacing scale off, so Tailwind
    // never generates `top-0` and the bar would have `top: auto`, which sticks to nothing. It is the
    // trap the top bar itself fell into (see `site-header.tsx`). The 56px is that bar's height, which
    // this one has to clear, and `z-10` keeps it under it rather than over it.
    <div className="sticky top-[56px] z-10 mb-3 border-b border-rule bg-ground pt-2 pb-3">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-label text-text-muted">
        {/* The count is read out as it changes: a mark that only appears beside a row is not news
            a screen reader gets on its own. */}
        <span aria-live="polite">
          <span className="text-text tabular-nums">{chosen}</span> selected
        </span>
        <button
          type="button"
          aria-busy={follows.followingMany || undefined}
          aria-disabled={wall !== null || undefined}
          aria-describedby={wall || refusal ? GROUP_WALL_ID : undefined}
          onClick={() => {
            if (!wall && !follows.followingMany) follows.followMany(selection.selected);
          }}
          className={`inline-flex h-[34px] items-center rounded-md border border-rule-strong px-3 font-sans text-body ${
            wall ? "cursor-not-allowed text-text-faint" : "text-text hover:bg-raised hover:border-text-faint"
          }`}
        >
          Follow {chosen}
        </button>
        <button
          type="button"
          onClick={selection.clear}
          className="min-h-6 rounded-[4px] px-2 font-mono text-label text-text-faint hover:bg-sunken hover:text-text"
        >
          clear
        </button>
      </p>
      {/* The wall is named before it is hit and inked only when the database says so, which is the
          pair the single Follow already has (DESIGN.md, Limit Note and Row Error Line). */}
      {refusal ? (
        <p id={GROUP_WALL_ID} className="mt-2 font-mono text-diagnostic text-breaking">
          <CircleX aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
          error: {groupFollowError(refusal, wallNow(chosen, follows.count))}
        </p>
      ) : (
        wall && (
          <p id={GROUP_WALL_ID} className="mt-2 font-mono text-diagnostic text-text-muted" role="status">
            <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
            note: {groupWallNote(wall)}
          </p>
        )
      )}
    </div>
  );
}
