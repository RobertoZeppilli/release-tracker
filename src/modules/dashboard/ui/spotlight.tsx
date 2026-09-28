import Link from "next/link";
import { releasePath } from "@/modules/releases";
import { isoDate, SeverityLabel, SignificanceLabel } from "@/modules/releases/ui";
import { InlineCode } from "@/modules/summaries/ui";
import type { DashboardRelease, SpotlightEntry, SpotlightStanding } from "../domain/build-dashboard";
import { rowVerdict } from "./dashboard-copy";
import { SectionTitle } from "./section-title";

// One row per followed Technology: the name keeps its own column, and the Releases stack beside it,
// so two featured Releases of the same Technology read as one entry and not as two Technologies.
const ROW = "grid grid-cols-[14ch_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule py-3 max-[880px]:grid-cols-1 max-[880px]:gap-y-2";
const CELL = "grid grid-cols-[17ch_11ch_minmax(0,1fr)] items-baseline gap-x-4 max-[880px]:grid-cols-[minmax(0,1fr)_auto]";

function TechnologyName({ slug, name, muted }: { slug: string; name: string; muted?: boolean }) {
  return (
    <Link
      href={`/technologies/${slug}`}
      className={`text-body no-underline hover:text-text ${muted ? "font-medium text-text-muted" : "font-semibold text-text"}`}
    >
      {name}
    </Link>
  );
}

function ReleaseVersion({ release }: { release: DashboardRelease }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-[6px]">
      <SignificanceLabel significance={release.significance} labelHidden />
      <Link
        href={releasePath(release.slug, release.version)}
        className="font-mono text-body text-text no-underline [overflow-wrap:anywhere] hover:underline"
      >
        {release.version}
      </Link>
    </span>
  );
}

function PublishedAt({ release }: { release: DashboardRelease }) {
  return (
    <time dateTime={isoDate(release.publishedAt)} className="font-mono text-label text-text-faint max-[880px]:justify-self-end">
      {isoDate(release.publishedAt)}
    </time>
  );
}

function FeaturedCell({ release }: { release: DashboardRelease }) {
  const verdict = rowVerdict(release);
  const breaking = release.summary?.breakingChanges ?? [];

  return (
    <div className={CELL}>
      <ReleaseVersion release={release} />
      <PublishedAt release={release} />
      <div className="min-w-0 max-[880px]:col-span-full">
        {release.summary && (
          <p className="max-w-measure text-body font-medium">
            <InlineCode text={release.summary.title} />
          </p>
        )}
        <p className="mt-[2px] font-mono text-diagnostic">
          <SeverityLabel tone={verdict.tone} label={verdict.label} pending={verdict.pending} />{" "}
          <span className={verdict.tone === "muted" ? "text-text-muted" : undefined}>{verdict.claim}</span>
        </p>
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

export function Spotlight({ entries }: { entries: readonly SpotlightEntry[] }) {
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
            {entry.featured.length > 0 ? (
              <div className="grid gap-y-3">
                {entry.featured.map((release) => (
                  <FeaturedCell key={release.version} release={release} />
                ))}
              </div>
            ) : entry.standing ? (
              <CompactCell standing={entry.standing} />
            ) : (
              <p className="font-mono text-diagnostic text-text-muted">no releases recorded yet</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
