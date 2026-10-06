import { Info } from "lucide-react";
import Link from "next/link";
import { SignificanceLabel } from "@/modules/releases/ui";
import { InlineCode } from "@/modules/summaries/ui";
import type { DashboardRelease, SpotlightEntry, SpotlightStanding } from "../domain/build-dashboard";
import { quietNote } from "./dashboard-copy";
import { BehindLine, PublishedAt, ReleaseVersion, RowVerdict, SummaryTitle, TechnologyName } from "./row-parts";
import { SectionTitle } from "./section-title";

// One row per followed Technology: the name keeps its own column, and the Releases stack beside it,
// so two featured Releases of the same Technology read as one entry and not as two Technologies.
const ROW_BASE =
  "grid grid-cols-[14ch_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule max-[880px]:grid-cols-1 max-[880px]:gap-y-2";
const ROW = `${ROW_BASE} py-3`;
// A Technology with nothing featured carries a version, a date and whatever distance it declared:
// three facts on one line, which do not need the padding of a row that carries a Summary.
const QUIET_ROW = `${ROW_BASE} py-2`;
const NOTE = "font-mono text-diagnostic text-text-muted";
const CELL = "grid grid-cols-[17ch_11ch_minmax(0,1fr)] items-baseline gap-x-4 max-[880px]:grid-cols-[minmax(0,1fr)_auto]";

function FeaturedCell({ release, thisWeek }: { release: DashboardRelease; thisWeek: string }) {
  const breaking = release.summary?.breakingChanges ?? [];

  return (
    <div className={CELL}>
      <ReleaseVersion release={release} />
      <PublishedAt release={release} thisWeek={thisWeek} />
      <div className="min-w-0 max-[880px]:col-span-full">
        <SummaryTitle release={release} />
        <RowVerdict release={release} />
        {breaking.length > 0 && (
          <ul aria-label={`Breaking changes in ${release.slug} ${release.version}`} className="mt-3 text-label">
            {breaking.map((change, index) => (
              <li key={change.change} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 py-[2px]">
                <span className="font-mono text-diagnostic whitespace-nowrap text-breaking">breaking[{index + 1}]:</span>
                <span>
                  <InlineCode text={change.change} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CompactCell({ standing }: { standing: SpotlightStanding }) {
  return (
    <div className={CELL}>
      <ReleaseVersion release={standing.release} glyphHidden />
      <PublishedAt release={standing.release} />
      {/* What the row shows is the latest major, or the latest Release where no major exists. That
          nothing was featured is said once by the group note above, not again on every row. */}
      <p className="min-w-0 font-mono text-diagnostic text-text-muted max-[880px]:col-span-full">
        latest {standing.major ? "major" : "release"}
      </p>
    </div>
  );
}

// The Version in use adds a line under the Releases, and only for whoever declared one: without a
// declaration the entry is wrapped in nothing extra and reads exactly as it did before.
function EntryCells({ entry, thisWeek }: { entry: SpotlightEntry; thisWeek: string }) {
  const cells =
    entry.featured.length > 0 ? (
      <div className="grid gap-y-3">
        {entry.featured.map((release) => (
          <FeaturedCell key={release.version} release={release} thisWeek={thisWeek} />
        ))}
      </div>
    ) : entry.standing ? (
      <CompactCell standing={entry.standing} />
    ) : (
      <p className="font-mono text-diagnostic text-text-muted">no releases recorded yet</p>
    );

  if (!entry.behind) return cells;
  return (
    <div className="grid gap-y-2">
      {cells}
      <BehindLine standing={entry.behind} />
    </div>
  );
}

export function Spotlight({ entries, thisWeek }: { entries: readonly SpotlightEntry[]; thisWeek: string }) {
  // The count is Releases, like every other section title on the page: `spotlight (5)` over five
  // rows that each said `none featured` was counting Technologies, and contradicting `0 featured`
  // in the summary two lines above.
  const featured = entries.reduce((total, entry) => total + entry.featured.length, 0);
  const loud = entries.filter((entry) => entry.featured.length > 0);
  const quiet = entries.filter((entry) => entry.featured.length === 0);
  // A row is worth its place when it carries a featured Release or a distance from the Version in
  // use. When not one of them does, the five compact rows say the same nothing five times, in the
  // space right under the verdict: one muted line says it once and gives the space back.
  const silent = entries.every((entry) => entry.featured.length === 0 && !entry.behind);

  return (
    <section id="spotlight" aria-labelledby="spotlight-title" className="mt-7 scroll-mt-4">
      <SectionTitle
        id="spotlight-title"
        title={`spotlight (${featured})`}
        aside={
          <span className="flex items-center gap-2">
            <SignificanceLabel significance="featured" />
            <span className="text-text-faint">· last 30 days</span>
          </span>
        }
      />
      {loud.length > 0 && <EntryRows entries={loud} thisWeek={thisWeek} />}
      {quiet.length > 0 && (
        <>
          <p className={loud.length > 0 ? `mt-5 mb-2 ${NOTE}` : NOTE}>
            <Info aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
            {loud.length > 0 ? (
              <>note: {quietNote(quiet.length, entries.length)} · latest major below</>
            ) : (
              <>
                note: nothing featured in the last 30 days, across the{" "}
                <Link
                  href="/technologies"
                  className="text-text-muted decoration-rule-strong hover:text-text hover:decoration-current"
                >
                  {entries.length} {entries.length === 1 ? "technology" : "technologies"} you follow
                </Link>
              </>
            )}
          </p>
          {!silent && <EntryRows entries={quiet} thisWeek={thisWeek} quiet />}
        </>
      )}
    </section>
  );
}

function EntryRows({
  entries,
  thisWeek,
  quiet,
}: {
  entries: readonly SpotlightEntry[];
  thisWeek: string;
  quiet?: boolean;
}) {
  return (
    <ul className="border-t border-rule">
      {entries.map((entry) => (
        <li key={entry.technology.slug} className={quiet ? QUIET_ROW : ROW}>
          <TechnologyName {...entry.technology} muted={entry.featured.length === 0} />
          <EntryCells entry={entry} thisWeek={thisWeek} />
        </li>
      ))}
    </ul>
  );
}
