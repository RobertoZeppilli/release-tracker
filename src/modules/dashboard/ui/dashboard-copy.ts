import { plural, type Tone } from "@/modules/releases/ui";
import type { DashboardRelease, DashboardVerdict } from "../domain/build-dashboard";

export type Verdict = { tone: Tone; label: string; claim: string; pending?: true };

// The page verdict counts Releases, not Technologies, and a Release without a ready Summary is
// never called safe: "nothing needs action" is what we know, not a promise that all is well.
export function pageVerdict({ needsAction }: DashboardVerdict): Verdict {
  if (needsAction === 0) return { tone: "ok", label: "ok:", claim: "nothing needs action" };
  return { tone: "action", label: "warning:", claim: `${needsAction} ${needsAction === 1 ? "needs" : "need"} action` };
}

// How one row reads its own Summary. A Release is called safe only by a ready Summary that says so;
// everything else says what is missing and where to look instead.
export function rowVerdict({ summary, summaryStatus }: DashboardRelease): Verdict {
  if (summary?.actionRequired === true) {
    const count = summary.breakingChanges.length;
    return { tone: "action", label: "warning:", claim: `action required · ${plural(count, "breaking change")}` };
  }
  if (summary?.actionRequired === false) return { tone: "ok", label: "ok:", claim: "safe to upgrade" };
  if (summaryStatus === "pending" || summaryStatus === "processing") {
    return { tone: "muted", label: "pending:", claim: "summary queued", pending: true };
  }
  return { tone: "muted", label: "note:", claim: "no summary · read the release notes" };
}
