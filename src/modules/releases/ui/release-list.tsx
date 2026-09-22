import type { GroupedReleases, ListedRelease } from "../domain/group-by-major";
import { Group, plural, ReleaseRow, Row, rowKey } from "./release-rows";

// Upcoming Previews are hidden for a retired Technology: none will follow.
export function ReleaseList({
  slug,
  grouped,
  retired,
}: {
  slug: string;
  grouped: GroupedReleases<ListedRelease>;
  retired: boolean;
}) {
  if (grouped.majors.length === 0 && grouped.previews.length === 0) {
    return <p className="mt-6 font-mono text-diagnostic text-text-muted">No releases recorded yet.</p>;
  }
  return (
    <>
      {grouped.majors.map((group) => (
        <Group key={group.major} id={`v${group.major}`} title={`v${group.major}`} detail={plural(group.count, "release")}>
          {group.rows.map((row) => (
            <Row key={rowKey(row)} slug={slug} row={row} />
          ))}
        </Group>
      ))}
      {!retired && grouped.previews.length > 0 && (
        <Group id="previews" title="previews" detail={grouped.latest ? `ahead of ${grouped.latest}` : "upcoming"}>
          {grouped.previews.map((release) => (
            <ReleaseRow key={release.version} slug={slug} release={release} />
          ))}
        </Group>
      )}
    </>
  );
}
