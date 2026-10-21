"use client";

import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { useRef } from "react";
import { TechnologyMark } from "@/modules/catalog/ui";
import type { PickerTechnology } from "../domain/picker";
import { useFollows } from "./follows-provider";
import { usePressFocus } from "./press-focus";

// DESIGN.md, Stack Row: one per followed Technology, two lines. The name and the latest Version on
// the first, the Category and the one thing that can be done to it on the second. No Distance bar:
// that measure belongs to the Dashboard's Standing, and this page reads no declared Version in use,
// so there would be nothing for a bar to be a share of (The Two Questions Rule).
export function StackRow({
  technology,
  retired = false,
}: {
  technology: PickerTechnology;
  retired?: boolean;
}) {
  const t = useTranslator();
  const follows = useFollows();
  // A retired Technology is only here because it is followed: once let go it belongs to no column at
  // all, so the row stays where it is and says that final thing where its control was.
  const gone = retired && !follows.isFollowing(technology.id);

  return (
    <li className="group border-b border-rule p-3 last:border-b-0">
      <span className="flex items-center gap-2">
        <span className="text-text-muted">
          <TechnologyMark slug={technology.slug} />
        </span>
        <Link
          href={`/technologies/${technology.slug}`}
          className="font-sans text-body leading-[1.45] font-semibold tracking-[-0.01em] text-text no-underline hover:underline hover:decoration-current"
        >
          {technology.name}
        </Link>
        {technology.latest && (
          <span className="ml-auto font-mono text-diagnostic leading-[normal] text-text-muted tabular-nums">
            {retired ? t("stack.row.lastVersion", { version: technology.latest }) : technology.latest}
          </span>
        )}
      </span>
      <span className="mt-[2px] flex items-center gap-3 font-mono text-label leading-[1.6] text-text-faint">
        {/* Ellipsised and never wrapped: a long Category must not turn a row of the list into three
            lines (DESIGN.md, Stack Row). */}
        <span className="min-w-0 truncate">{technology.category}</span>
        {gone ? (
          <span role="status" className="ml-auto text-right whitespace-nowrap text-text-muted">
            {t("stack.row.gone")}
          </span>
        ) : (
          <LetGo technology={technology} />
        )}
      </span>
    </li>
  );
}

// DESIGN.md, Stack Column: the way out of a follow, quiet and always there. Ten bordered buttons
// down a 360px column is a form to fill, and this column is a list to read. It is a real target all
// the same, 24px high and reached by the keyboard in row order (WCAG 2.2 AA 2.5.8), and it keeps the
// Toggle's own label, so `Unfollow <name>` names the same action wherever it is pressed.
function LetGo({ technology }: { technology: PickerTechnology }) {
  const t = useTranslator();
  const follows = useFollows();
  const button = useRef<HTMLButtonElement>(null);
  const pending = follows.isPending(technology.id);
  usePressFocus(technology.id, button, true);

  return (
    <button
      ref={button}
      type="button"
      aria-pressed
      aria-label={t("stack.unfollowName", { name: technology.name })}
      aria-busy={pending || undefined}
      onClick={() => {
        if (!pending) follows.toggle(technology.id);
      }}
      className="ml-auto inline-flex min-h-6 items-center rounded-[4px] px-2 font-mono text-label whitespace-nowrap text-text-faint group-hover:text-text-muted hover:bg-sunken hover:text-text"
    >
      {t("stack.row.unfollow")}
    </button>
  );
}
