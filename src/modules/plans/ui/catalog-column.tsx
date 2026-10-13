"use client";

import { ColumnTitle } from "@/components/column-title";
import type { Category } from "@/modules/catalog";
import {
  catalogCount,
  type CatalogLayout,
  type CatalogSort,
  narrowToCategory,
  readLayout,
  readSort,
} from "../domain/catalog-view";
import type { PickerTechnology } from "../domain/picker";
import { CategoryChips, LayoutChoice, SortChoice } from "./catalog-controls";
import { CatalogFilter } from "./catalog-filter";
import { CatalogGroups } from "./catalog-groups";
import { FollowToggleLimitNote } from "./limit-note";
import { Note } from "./note-line";
import { useViewPref } from "./view-prefs";

// DESIGN.md, Catalog Column: the right half of the page, and the answer to *what could go in my
// stack*. The head names the ordering in force and holds the one choice the column offers; the intro
// is the mirror of the panel's one line across the split, so each column explains itself once.
export function CatalogColumn({
  rows,
  query,
  onQuery,
  category,
  onCategory,
}: {
  rows: PickerTechnology[];
  query: string;
  onQuery: (query: string) => void;
  category: Category | null;
  onCategory: (category: Category | null) => void;
}) {
  const [layout, setLayout] = useViewPref<CatalogLayout>("catalog-layout", readLayout, "rows");
  const [sort, setSort] = useViewPref<CatalogSort>("catalog-sort", readSort, "name");
  const narrowed = narrowToCategory(rows, category);
  const { shown, total } = catalogCount(narrowed, query);

  return (
    <section aria-labelledby="catalog-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <ColumnTitle id="catalog-title">
          what you could add, by {sort === "release" ? "latest release" : "category"}
        </ColumnTitle>
        <LayoutChoice layout={layout} onLayout={setLayout} />
      </div>
      {/* One line, and short enough to end well before the choice above it: a sentence that runs
          the width of the column passes under the control and reads as its caption. */}
      <p className="mb-5 max-w-[52ch] font-mono text-label leading-[1.6] text-text-faint">
        each release here is summarized once, for everyone
      </p>

      <CatalogFilter
        query={query}
        onQuery={onQuery}
        shown={shown}
        total={total}
        category={category}
      />
      <CategoryChips category={category} onCategory={onCategory} />
      <SortChoice sort={sort} onSort={setSort} />

      {/* The wall, where the next Follow would happen. It names the wall and does not recount it:
          the number is in the panel across the split (DESIGN.md, Limit Note). */}
      <FollowToggleLimitNote />
      <CatalogGroups rows={narrowed} query={query} sort={sort} layout={layout} />

      {query.trim() !== "" && shown === 0 && (
        <section id="no-match" className="mt-7" aria-live="polite">
          <Note>
            no technology matches &ldquo;<span className="text-text">{query.trim()}</span>&rdquo;
          </Note>
          <p className="mt-3 max-w-measure text-text-muted">
            The catalog is curated, and requests for new technologies aren&apos;t open yet.
          </p>
        </section>
      )}
    </section>
  );
}
