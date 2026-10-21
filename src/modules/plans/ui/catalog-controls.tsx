"use client";

import { useTranslator } from "@/modules/i18n/ui";
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
  const t = useTranslator();

  return (
    <div
      role="group"
      aria-label={t("stack.catalog.layout")}
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

// DESIGN.md, Select Many: the mode is off until it is asked for, so nobody reads past a mark on
// 31 rows for an action they are not taking. It sits beside the layout choice, in the same shape.
export function SelectManyChoice({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const t = useTranslator();

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={`min-h-[26px] rounded-md border border-rule px-3 font-mono text-label hover:text-text ${
        on ? "bg-raised text-text" : "text-text-faint"
      }`}
    >
      {t("stack.catalog.selectMany")}
    </button>
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
  const t = useTranslator();
  // the word is `category`, which is what this ordering shows: the groups are the Categories and
  // the column title says `by category`. The value stays `name`, which is how the rows are ordered
  // inside each group and what is written in the address and in the stored preference.
  const options: { value: CatalogSort; label: string }[] = [
    { value: "name", label: t("stack.catalog.sort.category") },
    { value: "release", label: t("stack.catalog.sort.release") },
  ];

  return (
    <p className="mb-5 flex flex-wrap items-center gap-2 font-mono text-label text-text-faint">
      {t("stack.catalog.sortedBy")}
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
  const t = useTranslator();
  // Each chip is keyed by its Category, so a choice changes `aria-pressed` on nodes that stay: the
  // chip that was pressed is still the chip under the focus, with nothing to take back.
  return (
    <div role="group" aria-label={t("stack.catalog.category")} className="mb-3 flex flex-wrap gap-2">
      <Chip label={t("stack.catalog.all")} pressed={category === null} onPress={() => onCategory(null)} />
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
