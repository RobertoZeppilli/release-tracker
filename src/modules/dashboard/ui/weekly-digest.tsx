import Link from "next/link";
import { releasePath } from "@/modules/releases";
import { isoDate, plural, SignificanceLabel } from "@/modules/releases/ui";
import type { DashboardRow, DigestWeek as Week } from "../domain/sections";
import { weekRange } from "./dashboard-copy";
import { DigestWeek } from "./digest-week";
import { SectionTitle } from "./section-title";

// Digest Releases are never summarized, so a week can only ever say that nothing in it asks for
// work. It is a fact of the Significance, not a verdict read off a Summary.
const NO_ACTION = "no action needed";

export function WeeklyDigest({
  weeks,
  open,
  band,
}: {
  weeks: readonly Week[];
  open: readonly string[];
  band?: boolean;
}) {
  const total = weeks.reduce((count, week) => count + week.rows.length, 0);
  if (total === 0) return null;

  return (
    <section id="digest" aria-labelledby="digest-title" className="mt-7 scroll-mt-4">
      <SectionTitle
        id="digest-title"
        title={`weekly digest (${total})`}
        aside={
          <span className="flex items-center gap-2">
            <SignificanceLabel significance="digest" />
            <span className="text-text-faint">· by ISO week, UTC</span>
          </span>
        }
      />
      <ul className="border-t border-rule">
        {weeks.map((week) => (
          <li key={week.key}>
            <DigestWeek weekKey={week.key} open={open.includes(week.key)} summary={<WeekSummary week={week} band={band} />}>
              <WeekLines rows={week.rows} band={band} />
            </DigestWeek>
          </li>
        ))}
      </ul>
    </section>
  );
}

// In the closing band the week drops its date range, as it does on a phone, so the summary keeps
// the one line it is written for inside half a column.
function WeekSummary({ week, band }: { week: Week; band?: boolean }) {
  return (
    <>
      <span className="inline-flex items-center gap-[6px] text-text">
        <SignificanceLabel significance="digest" labelHidden />
        week {week.week.week}
      </span>
      <span>
        <span className="whitespace-nowrap">{plural(week.rows.length, "digest release")}</span>
        <span className={`max-[640px]:hidden ${band ? "min-[1040px]:hidden" : ""}`}>
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

function WeekLines({ rows, band }: { rows: readonly DashboardRow[]; band?: boolean }) {
  return (
    <ul
      className={`mb-3 grid grid-cols-[repeat(auto-fill,minmax(28ch,1fr))] gap-x-4 gap-y-[2px] font-mono text-diagnostic max-[640px]:grid-cols-1 sm:pl-[calc(14ch+var(--spacing-4))] ${band ? "min-[1040px]:pl-0" : ""}`}
    >
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
