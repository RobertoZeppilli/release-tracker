import type { Significance, SummaryStatus } from "@/modules/releases";
import { isSummarySettled, type ReleaseEvent, releaseEventFor } from "./events";
import { type Preference, wantsEvent } from "./preferences";

// A Release worth considering: its Significance is the effective one, `significance_override` already
// applied, because a Correzione di rilevanza set by hand is the one the reader sees.
export type ReleaseCandidate = {
  releaseId: string;
  technologyId: string;
  significance: Significance;
  summaryStatus: SummaryStatus;
};

export type Follower = { userId: string; technologyId: string };

export type PlannedNotification = { userId: string; event: ReleaseEvent; releaseId: string };

export type PlanInput = {
  candidates: readonly ReleaseCandidate[];
  followers: readonly Follower[];
  // Only the rows a Developer has actually saved; everything absent is the starting point.
  preferences: ReadonlyMap<string, readonly Preference[]>;
};

// Decides who hears about what. Pure, so the rule can be read and tested without a database: the
// job around it only writes what this returns, and writes it so that running twice is harmless.
export function planReleaseNotifications({ candidates, followers, preferences }: PlanInput): PlannedNotification[] {
  const byTechnology = new Map<string, string[]>();
  for (const follower of followers) {
    byTechnology.set(follower.technologyId, [...(byTechnology.get(follower.technologyId) ?? []), follower.userId]);
  }

  const planned: PlannedNotification[] = [];
  for (const candidate of candidates) {
    if (!isSummarySettled(candidate.summaryStatus)) continue;
    const event = releaseEventFor(candidate.significance);
    if (event === null) continue;
    for (const userId of byTechnology.get(candidate.technologyId) ?? []) {
      if (!wantsEvent(preferences.get(userId) ?? [], event)) continue;
      planned.push({ userId, event, releaseId: candidate.releaseId });
    }
  }
  return planned;
}
