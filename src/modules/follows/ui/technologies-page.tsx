"use client";

import { liveSections, type PickerSections } from "../domain/picker";
import { useCatalogAddress } from "./catalog-address";
import { CatalogColumn } from "./catalog-column";
import { useFollows } from "./follows-provider";
import { StackColumn } from "./stack-column";

// The two questions, a column each, and nothing printed in both (DESIGN.md, The Two Questions Rule):
// *what is in my stack* on the left, *what could go in it* on the right. A press moves the row from
// one column to the other on its own tick, so both lists are painted from the follows the page holds
// now rather than patched where the rows sit, and the control at the row's new place takes the focus
// back (DESIGN.md, Catalog Column).
//
// `retired` reads the server's own sections: letting a retired Technology go takes it out of every
// column, and the row stays where it is to say that final thing.
export function TechnologiesPage({ sections }: { sections: PickerSections }) {
  const { query, category, setQuery, setCategory } = useCatalogAddress();
  const follows = useFollows();
  const rows = [...sections.following, ...sections.catalog, ...sections.retired];
  const live = liveSections(
    sections,
    rows.filter((row) => follows.isFollowing(row.id)).map((row) => row.id),
  );

  return (
    <>
      <StackColumn rows={live.following} retired={sections.retired} />
      <CatalogColumn
        rows={live.catalog}
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
      />
    </>
  );
}
