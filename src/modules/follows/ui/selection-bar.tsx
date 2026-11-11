"use client";

import { CircleX } from "lucide-react";
import { useTranslator } from "@/modules/i18n/ui";
import { groupFollowError } from "../domain/group-follow";
import { useCatalogSelection } from "./catalog-selection";
import { useFollows } from "./follows-provider";

const GROUP_ERROR_ID = "group-error";

// DESIGN.md, Selection Bar: one line under the Catalog's head, sticky inside the column, with no
// fill and no border. It is the head staying put, not a surface arriving: a selection made at the
// thirty-first row with the action at the first is an accelerator that asks for a scroll back.
export function SelectionBar() {
  const t = useTranslator();
  const selection = useCatalogSelection();
  const follows = useFollows();
  const chosen = selection.selected.length;
  if (!selection.on || chosen === 0) return null;

  // A refusal belongs to the group, so the bar says it: a group has no row to carry it, the way a
  // single Follow does. It is the only line here now -- the note that named the room left on the
  // Free Plan before the press, and the wall that greyed the button out, went with the Plan
  // (issue #209, ADR 0011).
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
        <span aria-live="polite" className="text-text tabular-nums">
          {t("stack.selection.count", { count: chosen })}
        </span>
        <button
          type="button"
          aria-busy={follows.followingMany || undefined}
          aria-describedby={refusal ? GROUP_ERROR_ID : undefined}
          onClick={() => {
            if (!follows.followingMany) follows.followMany(selection.selected);
          }}
          className="inline-flex h-[34px] items-center rounded-md border border-rule-strong px-3 font-sans text-body text-text hover:border-text-faint hover:bg-raised"
        >
          {t("stack.selection.follow", { count: chosen })}
        </button>
        <button
          type="button"
          onClick={selection.clear}
          className="min-h-6 rounded-[4px] px-2 font-mono text-label text-text-faint hover:bg-sunken hover:text-text"
        >
          {t("stack.selection.clear")}
        </button>
      </p>
      {/* Inked only when the database says so, which is what an error line is for (DESIGN.md, Row
          Error Line). */}
      {refusal && (
        <p id={GROUP_ERROR_ID} className="mt-2 font-mono text-diagnostic text-breaking">
          <CircleX aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
          error: {groupFollowError(refusal, t)}
        </p>
      )}
    </div>
  );
}
