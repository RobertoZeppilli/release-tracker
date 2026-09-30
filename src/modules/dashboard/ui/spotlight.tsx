import { SignificanceLabel } from "@/modules/releases/ui";
import { InlineCode } from "@/modules/summaries/ui";
import type { DashboardRelease, SpotlightEntry, SpotlightStanding } from "../domain/build-dashboard";
import { BehindLine, PublishedAt, ReleaseVersion, RowVerdict, SummaryTitle, TechnologyName } from "./row-parts";
import { SectionTitle } from "./section-title";

// One row per followed Technology: the name keeps its own column, and the Releases stack beside it,
// so two featured Releases of the same Technology read as one entry and not as two Technologies.
const ROW = "grid grid-cols-[14ch_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule py-3 max-[880px]:grid-cols-1 max-[880px]:gap-y-2";
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
      <ReleaseVersion release={standing.release} />
      <PublishedAt release={standing.release} />
      <p className="min-w-0 font-mono text-diagnostic text-text-muted max-[880px]:col-span-full">
        latest {standing.major ? "major" : "release"} · none featured in 30 days
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
  return (
    <section id="spotlight" aria-labelledby="spotlight-title" className="mt-7 scroll-mt-4">
      <SectionTitle
        id="spotlight-title"
        title={`spotlight (${entries.length})`}
        aside={
          <span className="flex items-center gap-2">
            <SignificanceLabel significance="featured" />
            <span className="text-text-faint">· last 30 days</span>
          </span>
        }
      />
      <ul className="border-t border-rule">
        {entries.map((entry) => (
          <li key={entry.technology.slug} className={ROW}>
            <TechnologyName {...entry.technology} muted={entry.featured.length === 0} />
            <EntryCells entry={entry} thisWeek={thisWeek} />
          </li>
        ))}
      </ul>
    </section>
  );
}
