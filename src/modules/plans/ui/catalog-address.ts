"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { type Category, CategorySchema } from "@/modules/catalog";

export const FILTER_PARAM = "filter";
export const CATEGORY_PARAM = "category";

export type CatalogAddress = {
  query: string;
  category: Category | null;
  setQuery: (query: string) => void;
  setCategory: (category: Category | null) => void;
};

// DESIGN.md, The Address Rule: what the page is showing goes in the address, and the filter query
// and the chosen Category are both what is on the screen and both worth sending to someone. The
// state is what the page renders: the count is live, and a round trip per keystroke would lag
// behind the typing. The URL is written with `replaceState`, which the Next router picks up without
// reloading and without adding a history entry, so going back leaves the page instead of undoing a
// character. It is read once, here, and written from then on.
export function useCatalogAddress(): CatalogAddress {
  const params = useSearchParams();
  const [query, setQueryState] = useState(() => params.get(FILTER_PARAM) ?? "");
  const [category, setCategoryState] = useState<Category | null>(() =>
    readCategory(params.get(CATEGORY_PARAM)),
  );

  const write = useCallback((param: string, value: string) => {
    const search = new URLSearchParams(window.location.search);
    if (value.trim() === "") search.delete(param);
    else search.set(param, value);
    const rest = search.toString();
    window.history.replaceState(null, "", rest === "" ? window.location.pathname : `?${rest}`);
  }, []);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      write(FILTER_PARAM, next);
    },
    [write],
  );

  const setCategory = useCallback(
    (next: Category | null) => {
      setCategoryState(next);
      write(CATEGORY_PARAM, next ?? "");
    },
    [write],
  );

  return { query, category, setQuery, setCategory };
}

// A Category nobody curates is no Category at all: an address naming one is read as the whole
// Catalog rather than as an empty one, and the schema is what decides, not a cast.
function readCategory(value: string | null): Category | null {
  const parsed = CategorySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
