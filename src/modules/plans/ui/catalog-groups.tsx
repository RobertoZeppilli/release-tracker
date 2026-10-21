"use client";

import { useTranslator } from "@/modules/i18n/ui";
import type { CatalogLayout, CatalogSort } from "../domain/catalog-view";
import { sortByLatestRelease } from "../domain/catalog-view";
import { groupByCategory, matchesQuery, type PickerTechnology } from "../domain/picker";
import { CatalogRow } from "./catalog-row";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-stretch gap-4";

const TITLE_CLASS =
  "mb-2 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']";

// DESIGN.md, Catalog Column: by name the Catalog is read by Category, in the ten groups CONTEXT.md
// declares and in its order; by latest release the Categories go, replaced by one group, because a
// list ordered by date and cut into Categories is ordered by neither. Either way one title names the
// one ordering in force, and the column's own title names it again.
export function CatalogGroups({
  rows,
  query,
  sort,
  layout,
}: {
  rows: PickerTechnology[];
  query: string;
  sort: CatalogSort;
  layout: CatalogLayout;
}) {
  const t = useTranslator();
  if (sort === "release") {
    return (
      <Group
        id="catalog-latest"
        title={t("stack.catalog.latestFirst")}
        rows={sortByLatestRelease(rows)}
        query={query}
        layout={layout}
        date
      />
    );
  }

  return (
    <>
      {groupByCategory(rows).map((group) => (
        <Group
          key={group.category}
          id={`catalog-${group.category.replaceAll(" ", "-")}`}
          title={group.category}
          rows={group.rows}
          query={query}
          layout={layout}
        />
      ))}
    </>
  );
}

// The title counts the rows that belong to the group, and while the filter is on it says both
// numbers, so a group never looks smaller than it is. A group whose every row is filtered out is
// hidden rather than shown empty.
function Group({
  id,
  title,
  rows,
  query,
  layout,
  date = false,
}: {
  id: string;
  title: string;
  rows: PickerTechnology[];
  query: string;
  layout: CatalogLayout;
  date?: boolean;
}) {
  const t = useTranslator();
  const shown = rows.filter((row) => matchesQuery(row, query));
  if (shown.length === 0) return null;
  const count =
    query.trim() === ""
      ? `${rows.length}`
      : t("stack.catalog.shownOf", { shown: shown.length, total: rows.length });

  return (
    <section className="mt-5 first:mt-0" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className={TITLE_CLASS}>
        {title} ({count})
      </h3>
      {/* The same cells in the same order for the keyboard, read down or read across. Across, the
          cells of one line are stretched to the same height, so a description that wraps does not
          leave the one beside it short (DESIGN.md, Catalog Layout). */}
      <ul className={layout === "grid" ? GRID : undefined}>
        {rows.map((technology) => (
          <CatalogRow
            key={technology.id}
            technology={technology}
            hidden={!matchesQuery(technology, query)}
            layout={layout}
            date={date}
          />
        ))}
      </ul>
    </section>
  );
}
