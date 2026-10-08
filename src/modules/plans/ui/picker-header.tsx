"use client";

import { Info } from "lucide-react";
import { useEffect, useRef } from "react";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { useFollows } from "./follows-provider";

// The count is the one number the page keeps live: it follows the optimistic cache, while the
// sections stay as the visit found them. `your N free follows` and not `of N technologies`: the page
// declares 37 technologies a few lines below, so a bare 10 reads as another total instead of the
// Plan's allowance (DESIGN.md, Follow Status and Filter).
export function FollowStatus() {
  const { count } = useFollows();

  return (
    <p className="m-0 font-mono text-status text-text-muted tabular-nums">
      <Info aria-hidden className="mr-[0.4ch] inline size-[0.8em] align-[-0.08em]" />
      <span className="mr-[0.4ch]">note:</span>
      {/* Only the spoken sentence is live. The two visible ones say the same thing twice, once wide
          and once narrow, and a live region around all three made one toggle arrive three times. */}
      <span aria-live="polite" className="sr-only" data-testid="follow-status">
        you follow {count} of your {FREE_FOLLOW_LIMIT} free follows
      </span>
      <span aria-hidden className="max-sm:hidden">
        you follow <span className="text-text">{count}</span> of your {FREE_FOLLOW_LIMIT} free follows
      </span>
      <span aria-hidden className="sm:hidden">
        <span className="text-text">{count}</span> of your {FREE_FOLLOW_LIMIT}
      </span>
    </p>
  );
}

export function PickerFilter({
  query,
  onQuery,
  shown,
  total,
}: {
  query: string;
  onQuery: (query: string) => void;
  shown: number;
  total: number;
}) {
  const filtering = query.trim() !== "";
  const field = useRef<HTMLInputElement>(null);

  // `/` is the filter's shortcut, the one this audience reaches for first. It is announced to
  // assistive technology by `aria-keyshortcuts` and to the eye by the hint beside the count, and it
  // is only a shortcut when nothing else is listening: a `/` typed into a field, or with a modifier
  // held, belongs to whoever has the focus.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      // `instanceof` and not a cast: the target of a window event is whatever the page put there.
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      event.preventDefault();
      field.current?.focus();
      field.current?.select();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <p
      role="search"
      className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-diagnostic text-text-muted"
    >
      <label htmlFor="filter" className="max-sm:order-1">
        filter
      </label>
      <input
        ref={field}
        id="filter"
        type="search"
        aria-keyshortcuts="/"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="name or description"
        autoComplete="off"
        spellCheck={false}
        aria-describedby="matches"
        className="h-[38px] w-[26ch] rounded-md border border-rule-strong bg-sunken px-3 font-mono text-body text-text caret-help hover:border-text-faint placeholder:text-text-faint max-sm:order-2 max-sm:w-full"
      />
      <span id="matches" aria-live="polite" className="tabular-nums max-sm:order-1 max-sm:ml-auto">
        {filtering ? (
          <>
            <span className="text-text">{shown}</span> of {total} match
          </>
        ) : (
          <>
            <span className="text-text">{total}</span> technologies
          </>
        )}
      </span>
      {/* The hint is the shortcut's visible half, and it is a fact and not a control: faint Meta,
          no border, nothing to press. It goes at 640px and below, where the keyboard it talks
          about is usually not there. */}
      <span aria-hidden className="text-meta text-text-faint max-sm:hidden">
        press / to filter
      </span>
    </p>
  );
}
