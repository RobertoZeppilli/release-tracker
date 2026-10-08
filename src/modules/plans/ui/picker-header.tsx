"use client";

import { Info } from "lucide-react";
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

  return (
    <p
      role="search"
      className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-diagnostic text-text-muted"
    >
      <label htmlFor="filter" className="max-sm:order-1">
        filter
      </label>
      <input
        id="filter"
        type="search"
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
    </p>
  );
}
