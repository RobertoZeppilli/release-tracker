import { CATEGORIES, type Category } from "@/modules/catalog";

// The Catalog as a Developer picks from it: what is followed, what can still be followed, and the
// retired Technologies that are still followed. A retired Technology that nobody follows is not
// shown at all, because it can never be followed again (CONTEXT.md, "Seguire").
export type PickerTechnology = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latest: string | null;
  retired: boolean;
  category: Category;
};

export type PickerSections = {
  following: PickerTechnology[];
  catalog: PickerTechnology[];
  retired: PickerTechnology[];
};

export function splitPicker(
  technologies: readonly PickerTechnology[],
  followed: readonly string[],
): PickerSections {
  const follows = new Set(followed);
  const sections: PickerSections = { following: [], catalog: [], retired: [] };

  for (const technology of technologies) {
    const isFollowed = follows.has(technology.id);
    if (technology.retired) {
      if (isFollowed) sections.retired.push(technology);
    } else if (isFollowed) sections.following.push(technology);
    else sections.catalog.push(technology);
  }

  for (const section of Object.values(sections)) section.sort(byName);
  return sections;
}

function byName(a: PickerTechnology, b: PickerTechnology): number {
  return a.name.localeCompare(b.name, "en");
}

export function matchesQuery(technology: PickerTechnology, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === "") return true;
  return `${technology.name} ${technology.description}`.toLowerCase().includes(needle);
}

// The filter counts the rows the page holds, so an empty filter says how big the Catalog is.
export function countMatches(sections: PickerSections, query: string): { shown: number; total: number } {
  const rows = [...sections.following, ...sections.catalog, ...sections.retired];
  return { shown: rows.filter((row) => matchesQuery(row, query)).length, total: rows.length };
}

// Where every row belongs by the follows the page holds now, which is not where it sits: a row
// followed during the visit keeps its place until the next visit, so the section counts are the only
// thing that can tell the truth about it in the meantime. The rule is the one `splitPicker` uses, so
// the live count and the next visit can never disagree.
export function liveSections(sections: PickerSections, followed: readonly string[]): PickerSections {
  return splitPicker([...sections.following, ...sections.catalog, ...sections.retired], followed);
}

// The Catalog read by Category: ten groups of no more than eight rows instead of one list of
// thirty-two, which is the whole point of the grouping (issue #86). The order is the one `CATEGORIES`
// declares, and a Category with no row in hand is left out rather than shown empty: `following` and
// `retired` are never grouped, so only the `catalog` section goes through here.
export type CategoryGroup = { category: Category; rows: PickerTechnology[] };

export function groupByCategory(rows: readonly PickerTechnology[]): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    rows: rows.filter((row) => row.category === category),
  })).filter((group) => group.rows.length > 0);
}
