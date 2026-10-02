"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export const FILTER_PARAM = "filter";

// The filter lives in the URL so a reload keeps it and the address can be shared, but the state is
// what the page renders: the count is live, and a round trip per keystroke would lag behind the
// typing. The URL is written with `replaceState`, which the Next router picks up without reloading
// and without adding a history entry, so going back leaves the page instead of undoing a character.
export function useFilterQuery(): [string, (query: string) => void] {
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get(FILTER_PARAM) ?? "");

  const write = useCallback((next: string) => {
    setQuery(next);
    const search = new URLSearchParams(window.location.search);
    if (next.trim() === "") search.delete(FILTER_PARAM);
    else search.set(FILTER_PARAM, next);
    const rest = search.toString();
    window.history.replaceState(null, "", rest === "" ? window.location.pathname : `?${rest}`);
  }, []);

  return [query, write];
}
