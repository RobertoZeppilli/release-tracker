"use client";

import { type Category, CATEGORIES } from "@/modules/catalog";
import type { CatalogLayout, CatalogSort } from "../domain/catalog-view";

// DESIGN.md, Catalog Layout: two buttons in one group, the same rows read down or read across. The
// choice is remembered in this browser, because a layout that resets every visit is not a choice.
export function LayoutChoice({
  layout,
  onLayout,
}: {
  layout: CatalogLayout;
  onLayout: (layout: CatalogLayout) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Catalog layout"
      className="flex overflow-hidden rounded-md border border-rule"
    >
      {(["rows", "grid"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={layout === option}
          onClick={() => onLayout(option)}
          className={`min-h-[26px] px-3 font-mono text-label not-first:border-l not-first:border-rule hover:text-text ${
            layout === option ? "bg-raised text-text" : "text-text-faint"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// DESIGN.md, Catalog Ordering: the ordering is written where it is chosen and named again in the
// column title, because the ordering is the information.
export function SortChoice({
  sort,
  onSort,
}: {
  sort: CatalogSort;
  onSort: (sort: CatalogSort) => void;
}) {
  const options: { value: CatalogSort; label: string }[] = [
    { value: "name", label: "name" },
    { value: "release", label: "latest release" },
  ];

  return (
    <p className="mb-5 flex flex-wrap items-center gap-2 font-mono text-label text-text-faint">
      sorted by
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={sort === value}
          onClick={() => onSort(value)}
          className={`min-h-6 rounded-[4px] px-2 font-mono text-label hover:bg-sunken hover:text-text ${
            sort === value
              ? "text-text underline decoration-rule-strong underline-offset-[3px]"
              : "text-text-faint"
          }`}
        >
          {label}
        </button>
      ))}
    </p>
  );
}

// DESIGN.md, Category Chips: the ten Categories, reachable without scrolling to them, and carrying
// no counts, because the group titles under them already count the same sets. `all` is a chip and
// not an absence, so the way back out is where the way in was.
export function CategoryChips({
  category,
  onCategory,
}: {
  category: Category | null;
  onCategory: (category: Category | null) => void;
}) {
  // Each chip is keyed by its Category, so a choice changes `aria-pressed` on nodes that stay: the
  // chip that was pressed is still the chip under the focus, with nothing to take back.
  return (
    <div role="group" aria-label="Category" className="mb-3 flex flex-wrap gap-2">
      <Chip label="all" pressed={category === null} onPress={() => onCategory(null)} />
      {CATEGORIES.map((option) => (
        <Chip
          key={option}
          label={option}
          pressed={category === option}
          onPress={() => onCategory(option)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  pressed,
  onPress,
}: {
  label: string;
  pressed: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPress}
      className={`min-h-7 rounded-md border px-3 font-mono text-label hover:border-text-faint hover:text-text ${
        pressed ? "border-rule-strong bg-raised text-text" : "border-rule text-text-muted"
      }`}
    >
      {label}
    </button>
  );
}
