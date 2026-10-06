import type { ReactNode } from "react";
import { SignificanceLabel } from "@/modules/releases/ui";
import type { Significance } from "@/modules/releases";
import type { DashboardRow } from "../domain/sections";
import { PublishedAt, ReleaseVersion, RowVerdict, SummaryTitle, TechnologyName } from "./row-parts";
import { SectionTitle } from "./section-title";

// Latest and Previews are the same section with a different Significance: one flat row per
// Release, technology | version | date | what the Summary says.
const ROW =
  "grid grid-cols-[14ch_17ch_11ch_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule py-3 max-[880px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[880px]:gap-y-1";
// `band` is the section standing in half the column, inside the closing band of the page. Half a
// column is narrower than the 880px step, so the row reflows there as it does on a phone: name,
// version and date on the first line, the content across the width below.
const BAND_ROW = "min-[1040px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1040px]:gap-y-1";

export function ReleaseSection({
  id,
  title,
  significance,
  fact,
  rows,
  thisWeek,
  band,
}: {
  id: string;
  title: string;
  significance: Significance;
  fact: ReactNode;
  rows: readonly DashboardRow[];
  thisWeek: string;
  band?: boolean;
}) {
  if (rows.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-7 scroll-mt-4">
      <SectionTitle
        id={`${id}-title`}
        title={`${title} (${rows.length})`}
        aside={
          <span className="flex items-center gap-2">
            <SignificanceLabel significance={significance} />
            <span className="text-text-faint">· {fact}</span>
          </span>
        }
      />
      <ul className="border-t border-rule">
        {rows.map(({ technology, release }) => (
          <li key={`${release.slug} ${release.version}`} className={band ? `${ROW} ${BAND_ROW}` : ROW}>
            <TechnologyName {...technology} />
            <ReleaseVersion release={release} />
            <PublishedAt release={release} thisWeek={thisWeek} band={band} />
            <div className={`min-w-0 max-[880px]:col-span-full ${band ? "min-[1040px]:col-span-full" : ""}`}>
              <SummaryTitle release={release} />
              <RowVerdict release={release} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
