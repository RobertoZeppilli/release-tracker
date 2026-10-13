import type { Judged, SummaryContent } from "@/modules/summaries";
import type { Significance, SummaryStatus } from "@/modules/releases";

// The Version in use is declared, never observed, so it travels with the day it was declared: a
// count built on it is only readable next to that day (CONTEXT.md, Versione in uso).
export type CurrentVersion = { version: string; declaredAt: Date };

export type FollowedTechnology = {
  slug: string;
  name: string;
  currentVersion: CurrentVersion | null;
};

// `summary` is the content of a ready Summary, already validated; null while there is none. The
// verdict comes with it instead of being read off the content, because a ready Summary does not
// always carry one: see `Judged` (CONTEXT.md, Note giudicabili).
export type DashboardRelease = Judged & {
  slug: string;
  version: string;
  significance: Significance;
  publishedAt: Date;
  summaryStatus: SummaryStatus | null;
  summary: SummaryContent | null;
};

// A row of the Stream or of the Weekly Digest: the Release plus the Technology it belongs to,
// because the Stream mixes Technologies and every line has to name its own.
export type DashboardRow = {
  technology: FollowedTechnology;
  release: DashboardRelease;
};
