import Link from "next/link";
import { releasePath } from "@/modules/releases";
import { isoDate, plural, SignificanceLabel } from "@/modules/releases/ui";
import type { DashboardRow } from "../domain/followed";
import type { DigestWeek as Week } from "../domain/stream";
import { hushClaim, hushSpan, NO_ACTION, weekRange } from "./dashboard-copy";
import { DigestWeek } from "./digest-week";

// The quiet end of the Stream, and no longer a section: a stretch of time that asked nothing of the
// reader takes one row instead of a list, and the weeks open out of it (DESIGN.md, Weekly Digest).
// One row for the whole stretch, never one per week: four rows each saying a different week was
// silent is four rows saying nothing.
export function WeeklyDigest({ weeks, open }: { weeks: readonly Week[]; open: readonly string[] }) {
  const total = weeks.reduce((count, week) => count + week.rows.length, 0);
  if (total === 0) return null;

  return (
    <details id="digest" className="border-t border-rule font-mono text-label text-text-faint">
      <summary className="group grid cursor-pointer list-none grid-cols-[11ch_minmax(0,1fr)] gap-5 py-3 [&::-webkit-details-marker]:hidden max-[640px]:grid-cols-[minmax(0,1fr)] max-[640px]:gap-2">
        <span className="whitespace-nowrap">{hushSpan(weeks)}</span>
        <span className="inline-flex flex-wrap items-center gap-[1ch] group-hover:text-text">
          {hushClaim(total)}
          <span className="text-help">open by week ›</span>
        </span>
      </summary>
      {weeks.map((week) => (
        <DigestWeek
          key={week.key}
          weekKey={week.key}
          open={open.includes(week.key)}
          summary={<WeekSummary week={week} />}
        >
          <WeekLines rows={week.rows} />
        </DigestWeek>
      ))}
    </details>
  );
}

function WeekSummary({ week }: { week: Week }) {
  return (
    <>
      <span className="inline-flex items-center gap-[6px] text-text">
        <SignificanceLabel significance="digest" labelHidden />
        week {week.week.week}
      </span>
      <span>
        <span className="whitespace-nowrap">{plural(week.rows.length, "digest release")}</span>
        <span className="max-[640px]:hidden">
          {" · "}
          {weekRange(week.start, week.end)}
        </span>
        <span className="whitespace-nowrap max-[640px]:block">
          <span className="max-[640px]:hidden"> · </span>
          {NO_ACTION}
        </span>
      </span>
    </>
  );
}

// Newest first, in a 28ch auto-fill grid: the Technology in `text-muted`, the version link in
// `text` and a faint `MM-DD` (DESIGN.md, Weekly Digest).
function WeekLines({ rows }: { rows: readonly DashboardRow[] }) {
  return (
    <ul className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(28ch,1fr))] gap-x-4 gap-y-[2px] pl-[calc(14ch+var(--spacing-4))] max-[640px]:grid-cols-1 max-[640px]:pl-0">
      {rows.map(({ technology, release }) => (
        <li key={`${release.slug} ${release.version}`}>
          <span className="text-text-muted">{technology.name}</span>{" "}
          <Link href={releasePath(release.slug, release.version)} className="text-text no-underline hover:underline">
            {release.version}
          </Link>
          <time dateTime={isoDate(release.publishedAt)} className="ml-[1ch] text-text-faint">
            {isoDate(release.publishedAt).slice(5)}
          </time>
        </li>
      ))}
    </ul>
  );
}
