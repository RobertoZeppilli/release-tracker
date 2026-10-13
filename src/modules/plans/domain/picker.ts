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
  // The day that Version came out, as an ISO day, for the Catalog's other ordering. It is null
  // wherever `latest` is, because it is that Release's own date and not the newest date there is.
  latestAt: string | null;
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

// Where every row belongs by the follows the page holds now. A press moves the row across the split
// on the tick it is pressed, so this is what both columns are painted from, and it is the rule
// `splitPicker` uses: what the page shows and what the next visit finds can never disagree.
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
