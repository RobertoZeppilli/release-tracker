import Link from "next/link";
import { releasePath } from "@/modules/releases";
import { isoDate, SeverityLabel, SignificanceLabel } from "@/modules/releases/ui";
import { InlineCode } from "@/modules/summaries/ui";
import type { BehindStanding, DashboardRelease } from "../domain/build-dashboard";
import { isoWeekKey, isoWeekOf } from "../domain/iso-week";
import { behindLine, rowVerdict } from "./dashboard-copy";

// The pieces every row of the Dashboard is made of, shared by Spotlight, Latest and Previews so
// the same Release reads the same way wherever it appears.
export function TechnologyName({ slug, name, muted }: { slug: string; name: string; muted?: boolean }) {
  return (
    <Link
      href={`/technologies/${slug}`}
      className={`text-body no-underline hover:text-text ${muted ? "font-medium text-text-muted" : "font-semibold text-text"}`}
    >
      {name}
    </Link>
  );
}

// `glyphHidden` is for a row that is not about Significance: the compact Spotlight row says where a
// Technology stands, and the shape of a Release published outside the window only contradicts it.
export function ReleaseVersion({ release, glyphHidden }: { release: DashboardRelease; glyphHidden?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-[6px]">
      {!glyphHidden && <SignificanceLabel significance={release.significance} labelHidden />}
      <Link
        href={releasePath(release.slug, release.version)}
        className="font-mono text-body text-text no-underline [overflow-wrap:anywhere] hover:underline"
      >
        {release.version}
      </Link>
    </span>
  );
}

// "this week" is the current ISO week in UTC, the same week the Weekly Digest folds by.
export function PublishedAt({ release, thisWeek }: { release: DashboardRelease; thisWeek?: string }) {
  const recent = thisWeek !== undefined && isoWeekKey(isoWeekOf(release.publishedAt)) === thisWeek;

  return (
    <span className="flex flex-col font-mono text-label text-text-faint max-[880px]:items-end max-[880px]:justify-self-end">
      <time dateTime={isoDate(release.publishedAt)}>{isoDate(release.publishedAt)}</time>
      {recent && <span className="text-meta text-text-muted">this week</span>}
    </span>
  );
}

export function RowVerdict({ release }: { release: DashboardRelease }) {
  const verdict = rowVerdict(release);

  return (
    <p className="mt-[2px] font-mono text-diagnostic">
      <SeverityLabel tone={verdict.tone} label={verdict.label} pending={verdict.pending} />{" "}
      <span className={verdict.tone === "muted" ? "text-text-muted" : undefined}>{verdict.claim}</span>
    </p>
  );
}

export function SummaryTitle({ release }: { release: DashboardRelease }) {
  if (!release.summary) return null;

  return (
    <p className="max-w-measure text-body font-medium">
      <InlineCode text={release.summary.title} />
    </p>
  );
}

// Where a followed Technology stands against its Version in use. It is neutral, like the compact
// line it sits under: the distance is a fact, and the row above already carries whatever ink the
// Releases earned. The Technology name is the link to the path, so the line adds no second one.
export function BehindLine({ standing }: { standing: BehindStanding }) {
  return <p className="font-mono text-diagnostic text-text-muted">{behindLine(standing)}</p>;
}
