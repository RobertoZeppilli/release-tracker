"use client";

import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { countMatches, liveSections, type PickerSections } from "../domain/picker";
import { useFilterQuery } from "./filter-query";
import { useFollows } from "./follows-provider";
import { FollowToggleLimitNote } from "./limit-note";
import { FollowStatus, PickerFilter } from "./picker-header";
import { CatalogSection, FlatSection, Note } from "./picker-section";

// A toggle moves the row: following one sends it to `following` on the same tick the count and the
// follow status move, so what the page says and what it shows can never disagree. This reverses the
// first shape of the page, where a row kept its place until the next visit to keep the list still
// under the pointer; honest counts alone were tried first (issue #64) and a Developer still had to
// reload to find the row they had just followed. What pays for the move is the focus: the Toggle
// takes it back at the row's new place, so the press keeps its place for the keyboard and the eye.
// The move is instant and the page animates nothing, which leaves the caret draw the one motion
// moment the system declares.
//
// `retired` is the exception, and it reads from the server's sections: letting a retired Technology
// go takes it out of every section, and the row stays where it is to say that final thing. Inside
// `catalog` the rows are read by Category (issue #86); `following` and `retired` stay one list each.
export function TechnologyPicker({ sections }: { sections: PickerSections }) {
  const [query, setQuery] = useFilterQuery();
  const follows = useFollows();
  const { shown, total } = countMatches(sections, query);
  const rows = [...sections.following, ...sections.catalog, ...sections.retired];
  const live = liveSections(sections, rows.filter((row) => follows.isFollowing(row.id)).map((row) => row.id));

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

      <FlatSection id="following" rows={live.following} query={query} />
      <CatalogSection rows={live.catalog} query={query}>
        <FollowToggleLimitNote />
      </CatalogSection>
      {sections.retired.length > 0 && (
        <FlatSection id="retired" rows={sections.retired} belong={live.retired} query={query}>
          <Note>
            <span className="font-sans text-body">
              These are no longer in the catalog and get no new releases. Past releases stay readable. They
              still count toward your {FREE_FOLLOW_LIMIT}, and once unfollowed they can&apos;t be followed
              again.
            </span>
          </Note>
        </FlatSection>
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
