"use client";

import { Info } from "lucide-react";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { countMatches, matchesQuery, type PickerSections, type PickerTechnology } from "../domain/picker";
import { useFilterQuery } from "./filter-query";
import { FollowToggleLimitNote } from "./limit-note";
import { FollowStatus, PickerFilter } from "./picker-header";
import { PickerRow } from "./picker-row";

// The sections come from the server and never move: following and unfollowing change the toggle and
// the count, not where a row sits, so a list does not shift under the pointer mid visit.
export function TechnologyPicker({ sections }: { sections: PickerSections }) {
  const [query, setQuery] = useFilterQuery();
  const { shown, total } = countMatches(sections, query);

  return (
    <>
      <section aria-label="Follow status">
        <FollowStatus />
        <p className="mt-3 max-w-measure text-text-muted">
          Your dashboard shows releases from the technologies you follow. Releases are detected for every
          technology in the catalog, and each release is summarized once, for everyone.
        </p>
        <PickerFilter query={query} onQuery={setQuery} shown={shown} total={total} />
      </section>

      <Section id="following" rows={sections.following} query={query} />
      <Section id="catalog" rows={sections.catalog} query={query}>
        <FollowToggleLimitNote />
      </Section>
      {sections.retired.length > 0 && (
        <Section id="retired" rows={sections.retired} query={query}>
          <Note>
            <span className="font-sans text-body">
              These are no longer in the catalog and get no new releases. Past releases stay readable. They
              still count toward your {FREE_FOLLOW_LIMIT}, and once unfollowed they can&apos;t be followed
              again.
            </span>
          </Note>
        </Section>
      )}

      {query.trim() !== "" && shown === 0 && (
        <section className="mt-7" aria-live="polite">
          <Note>
            no technology matches &ldquo;<span className="text-text">{query.trim()}</span>&rdquo;
          </Note>
          <p className="mt-3 max-w-measure text-text-muted">
            The catalog is curated, and requests for new technologies aren&apos;t open yet.
          </p>
        </section>
      )}
    </>
  );
}

function Section({
  id,
  rows,
  query,
  children,
}: {
  id: string;
  rows: PickerTechnology[];
  query: string;
  children?: React.ReactNode;
}) {
  const visible = rows.filter((row) => matchesQuery(row, query));
  if (rows.length > 0 && visible.length === 0) return null;
  // While the filter is on, the title says both numbers, so a section never looks smaller than it is.
  const count = query.trim() === "" ? `${rows.length}` : `${visible.length} of ${rows.length}`;

  return (
    <section className="mt-7" aria-labelledby={`${id}-title`}>
      <h2
        id={`${id}-title`}
        className="mb-2 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']"
      >
        {id} ({count})
      </h2>
      {children}
      <ul>
        {rows.map((technology) => (
          <PickerRow key={technology.id} technology={technology} hidden={!matchesQuery(technology, query)} />
        ))}
      </ul>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 max-w-[900px] font-mono text-diagnostic text-text-muted">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: {children}
    </p>
  );
}
