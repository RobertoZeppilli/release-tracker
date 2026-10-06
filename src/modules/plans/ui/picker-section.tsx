"use client";

import { Info } from "lucide-react";
import {
  type CategoryGroup,
  groupByCategory,
  matchesQuery,
  type PickerSections,
  type PickerTechnology,
} from "../domain/picker";
import { PickerRow } from "./picker-row";

const TITLE_CLASS =
  "mb-2 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']";

// The title counts the rows that belong to the section now, wherever they sit; the filter counts the
// ones it would let through. While the filter is on the title says both numbers, so a section never
// looks smaller than it is.
function count(belong: readonly PickerTechnology[], query: string): string {
  if (query.trim() === "") return `${belong.length}`;
  return `${belong.filter((row) => matchesQuery(row, query)).length} of ${belong.length}`;
}

// A section whose every row is filtered out is hidden, and so is a Category group inside the Catalog:
// one rule, applied at both levels, so a narrow filter leaves the rows it found and nothing else
// (DESIGN.md, "Picker Sections").
function allFilteredOut(rows: readonly PickerTechnology[], query: string): boolean {
  return rows.length > 0 && rows.every((row) => !matchesQuery(row, query));
}

export function FlatSection({
  id,
  rows,
  belong,
  query,
  children,
}: {
  id: keyof PickerSections;
  rows: PickerTechnology[];
  belong: PickerTechnology[];
  query: string;
  children?: React.ReactNode;
}) {
  if (allFilteredOut(rows, query)) return null;

  return (
    <section className="mt-7" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={TITLE_CLASS}>
        {id} ({count(belong, query)})
      </h2>
      {children}
      <RowList rows={rows} section={id} query={query} />
    </section>
  );
}

// The Catalog keeps its own title and count, because that number is what says how large the Catalog
// is, and the Limit Note still sits right under it, where the next Follow would happen. The Category
// groups are the level below: same Section Title, one step in, and the sum of their counts is the
// Catalog count.
export function CatalogSection({
  rows,
  belong,
  query,
  children,
}: {
  rows: PickerTechnology[];
  belong: PickerTechnology[];
  query: string;
  children?: React.ReactNode;
}) {
  if (allFilteredOut(rows, query)) return null;
  const groups = groupByCategory(rows);
  const belongByCategory = new Map(groupByCategory(belong).map((group) => [group.category, group.rows]));

  return (
    <section className="mt-7" aria-labelledby="catalog-title">
      <h2 id="catalog-title" className={TITLE_CLASS}>
        catalog ({count(belong, query)})
      </h2>
      {children}
      {groups.map((group) => (
        <CategoryBlock
          key={group.category}
          group={group}
          belong={belongByCategory.get(group.category) ?? []}
          query={query}
        />
      ))}
    </section>
  );
}

function CategoryBlock({
  group,
  belong,
  query,
}: {
  group: CategoryGroup;
  belong: PickerTechnology[];
  query: string;
}) {
  if (allFilteredOut(group.rows, query)) return null;
  const id = `catalog-${group.category.replaceAll(" ", "-")}`;

  return (
    <section className="mt-5" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className={TITLE_CLASS}>
        {group.category} ({count(belong, query)})
      </h3>
      <RowList rows={group.rows} section="catalog" query={query} />
    </section>
  );
}

function RowList({
  rows,
  section,
  query,
}: {
  rows: PickerTechnology[];
  section: keyof PickerSections;
  query: string;
}) {
  return (
    <ul>
      {rows.map((technology) => (
        <PickerRow
          key={technology.id}
          technology={technology}
          section={section}
          hidden={!matchesQuery(technology, query)}
        />
      ))}
    </ul>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 max-w-[900px] font-mono text-diagnostic text-text-muted">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: {children}
    </p>
  );
}
