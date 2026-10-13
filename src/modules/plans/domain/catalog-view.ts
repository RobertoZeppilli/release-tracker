import type { Category } from "@/modules/catalog";
import { matchesQuery, type PickerTechnology } from "./picker";

// How the Catalog column is being read: the layout and the ordering are this reader's own and live
// in their browser, the chosen Category is what the page is showing and lives in the address
// (DESIGN.md, The Address Rule). The domain only knows the values and what they mean.
export const CATALOG_LAYOUTS = ["rows", "grid"] as const;
export const CATALOG_SORTS = ["name", "release"] as const;

export type CatalogLayout = (typeof CATALOG_LAYOUTS)[number];
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export function readLayout(value: string | null): CatalogLayout {
  return value === "grid" ? "grid" : "rows";
}

export function readSort(value: string | null): CatalogSort {
  return value === "release" ? "release" : "name";
}

// By latest release the Categories go: a list ordered by date and cut into Categories is ordered by
// neither (DESIGN.md, Catalog Ordering). Ties break by name, so the order is total and the list
// never shuffles between paints, and a Technology with no Release at all goes last rather than
// first: an unknown date is not a very old one.
export function sortByLatestRelease(rows: readonly PickerTechnology[]): PickerTechnology[] {
  return [...rows].sort(
    (a, b) =>
      (b.latestAt ?? "").localeCompare(a.latestAt ?? "") || a.name.localeCompare(b.name, "en"),
  );
}

export function narrowToCategory(
  rows: readonly PickerTechnology[],
  category: Category | null,
): PickerTechnology[] {
  return category === null ? [...rows] : rows.filter((row) => row.category === category);
}

// The filter belongs to the Catalog and counts the Catalog: the stack is beside it in full view, and
// a count covering both would print a total neither column holds (DESIGN.md, Catalog Filter).
export function catalogCount(
  rows: readonly PickerTechnology[],
  query: string,
): { shown: number; total: number } {
  return { shown: rows.filter((row) => matchesQuery(row, query)).length, total: rows.length };
}
