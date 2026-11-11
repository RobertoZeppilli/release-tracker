"use client";

import { useEffect, useRef } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import type { Category } from "@/modules/catalog";

// DESIGN.md, Catalog Filter: the field gets a line of its own, with the label above it and the count
// and the hint below. The line it replaces carried four unrelated parts, a label, the field, the
// count and the hint, and the eye had to pick the field out of the row.
export function CatalogFilter({
  query,
  onQuery,
  shown,
  total,
  category,
}: {
  query: string;
  onQuery: (query: string) => void;
  shown: number;
  total: number;
  category: Category | null;
}) {
  const t = useTranslator();
  const field = useRef<HTMLInputElement>(null);
  const filtering = query.trim() !== "";
  // The count says where it is counting, so a small total never reads as a small Catalog. Four
  // whole sentences and not one with ` in {category}` glued on: a fragment is what a translation
  // cannot move inside its own sentence.
  const counted = filtering
    ? category === null
      ? t("stack.catalog.match", { shown, total })
      : t("stack.catalog.matchIn", { shown, total, category })
    : category === null
      ? t("stack.catalog.total", { count: total })
      : t("stack.catalog.totalIn", { count: total, category });

  // `/` is the filter's shortcut, the one this audience reaches for first. It is announced to
  // assistive technology by `aria-keyshortcuts` and to the eye by the hint beside the count, and it
  // is only a shortcut when nothing else is listening: a `/` typed into a field, or with a modifier
  // held, belongs to whoever has the focus.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      // `instanceof` and not a cast: the target of a window event is whatever the page put there.
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      event.preventDefault();
      field.current?.focus();
      field.current?.select();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div role="search" className="mb-5">
      <label
        htmlFor="filter"
        className="mb-2 block font-mono text-label leading-[normal] text-text-faint"
      >
        {t("stack.catalog.find")}
      </label>
      <input
        ref={field}
        id="filter"
        type="search"
        aria-keyshortcuts="/"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        // Esc empties the field and leaves the focus in it: the way out of a filter is the key every
        // field already answers to, and the hint beside the count says so.
        onKeyDown={(event) => {
          if (event.key !== "Escape" || query === "") return;
          event.preventDefault();
          onQuery("");
        }}
        placeholder={t("stack.catalog.placeholder")}
        autoComplete="off"
        spellCheck={false}
        aria-describedby="matches"
        className="block h-[42px] w-full max-w-[38ch] rounded-md border border-rule-strong bg-sunken px-3 font-mono text-body text-text caret-link hover:border-text-faint focus-visible:border-text-faint placeholder:text-text-faint max-sm:max-w-none"
      />
      <p className="mt-2 flex items-baseline gap-3 font-mono text-label leading-[normal] text-text-muted">
        <span id="matches" aria-live="polite" className="text-text tabular-nums">
          {counted}
        </span>
        {/* Facts and not controls: no border, nothing to press, and gone at 640px and below, where
            the keyboard they talk about usually is not. */}
        <span aria-hidden className="text-meta text-text-faint max-sm:hidden">
          {t("stack.catalog.keys")}
        </span>
      </p>
    </div>
  );
}
