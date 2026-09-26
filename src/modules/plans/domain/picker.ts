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
