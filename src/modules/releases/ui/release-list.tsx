import type { Translator } from "@/modules/i18n";
import type { PathMajor, SummarizedRelease } from "../domain/upgrade-path";
import { MajorBar, MajorWords } from "./major-bar";
import { ReleaseRowContent } from "./release-row-content";
import { Group, ReleaseRow, Row, rowKey } from "./release-rows";

// The whole recorded history, newest major first. The majors arrive already counted, because every
// group title is a stat row now: the list and the counts over it used to be two things that counted
// the same Releases 300px apart (DESIGN.md, Stat Row).
//
// Upcoming Previews are hidden for a retired Technology: none will follow.
export function ReleaseList({
  slug,
  majors,
  previews,
  latest,
  retired,
  t,
}: {
  slug: string;
  majors: PathMajor<SummarizedRelease>[];
  previews: SummarizedRelease[];
  latest: string | null;
  retired: boolean;
  t: Translator;
}) {
  if (majors.length === 0 && previews.length === 0) {
    return <p className="font-mono text-diagnostic text-text-muted">{t("release.none")}</p>;
  }
  // A bar is a comparison, and one group has nothing to compare itself with (DESIGN.md, Stat Row).
  const widest = Math.max(1, ...majors.map((group) => group.counts.total));
  const bars = majors.length > 1;

  return (
    <div className="[&>section+section]:mt-7">
      {majors.map((group) => (
        <Group
          key={group.major}
          id={`v${group.major}`}
          title={`v${group.major}`}
          words={<MajorWords counts={group.counts} t={t} />}
          bar={bars ? <MajorBar counts={group.counts} widest={widest} /> : undefined}
        >
          {group.rows.map((row) => (
            <Row
              key={rowKey(row)}
              slug={slug}
              row={row}
              verdict={(release) => <ReleaseRowContent slug={slug} release={release} t={t} />}
              t={t}
            />
          ))}
        </Group>
      ))}
      {!retired && previews.length > 0 && (
        <Group
          id="previews"
          title="previews"
          words={latest ? t("path.previews.ahead", { version: latest }) : t("path.previews.upcoming")}
        >
          {previews.map((release) => (
            <ReleaseRow key={release.version} slug={slug} release={release}>
              <ReleaseRowContent slug={slug} release={release} t={t} />
            </ReleaseRow>
          ))}
        </Group>
      )}
    </div>
  );
}
