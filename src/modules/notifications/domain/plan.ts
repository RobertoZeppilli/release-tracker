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

export type PlannedNotification = { event: ReleaseEvent; releaseId: string };

export type PlanInput = {
  candidates: readonly ReleaseCandidate[];
  // The Technologies followed, which is the whole of the `follows` table: there is one person per
  // installed copy, so every follow in it is theirs (issue #210, ADR 0011).
  followed: readonly string[];
  // Only the rows actually saved; everything absent is the declared starting point.
  preferences: readonly Preference[];
};

// Decides what is worth hearing about. Pure, so the rule can be read and tested without a database:
// the job around it only writes what this returns, and writes it so that running twice is harmless.
//
// ⚠️ It used to decide **who** as well, and that half left with the account (issue #210): a planned
// Notification no longer names anybody, because there is nobody it could name.
export function planReleaseNotifications({ candidates, followed, preferences }: PlanInput): PlannedNotification[] {
  const following = new Set(followed);

  const planned: PlannedNotification[] = [];
  for (const candidate of candidates) {
    if (!isSummarySettled(candidate.summaryStatus)) continue;
    if (!following.has(candidate.technologyId)) continue;
    const event = releaseEventFor(candidate.significance);
    if (event === null) continue;
    if (!wantsEvent(preferences, event)) continue;
    planned.push({ event, releaseId: candidate.releaseId });
  }
  return planned;
}
