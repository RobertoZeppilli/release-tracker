import type { SummaryContent } from "@/modules/summaries";
import type { CurrentVersion, DashboardRelease, FollowedTechnology } from "./followed";

// What the tests of the two columns are built from. The Dashboard reads a Developer's whole set of
// follows and Releases, so a test that says anything about an order or a count needs several of
// both, and the factories keep the irrelevant fields out of the test that does not care.
export const NOW = new Date("2024-12-06T12:00:00Z");

export function technology(slug: string, name: string, inUse?: CurrentVersion): FollowedTechnology {
  return { slug, name, currentVersion: inUse ?? null };
}

export function declared(version: string, day = "2024-09-12"): CurrentVersion {
  return { version, declaredAt: new Date(`${day}T00:00:00Z`) };
}

export function summary(options: Partial<SummaryContent> = {}): SummaryContent {
  return {
    title: "Actions, the use API and ref as a prop arrive.",
    actionRequired: false,
    keyPoints: [{ text: "one" }, { text: "two" }, { text: "three" }],
    breakingChanges: [],
    ...options,
  };
}

export function needsAction(): SummaryContent {
  return summary({
    actionRequired: true,
    breakingChanges: [{ change: "String refs are removed", migration: "Use callback refs" }],
  });
}

export function release(options: Partial<DashboardRelease> & { slug: string; version: string }): DashboardRelease {
  const row: DashboardRelease = {
    significance: "featured",
    publishedAt: new Date("2024-12-05T00:00:00Z"),
    summaryStatus: "ready",
    summary: summary(),
    actionRequired: false,
    unjudged: false,
    ...options,
  };
  // A test that states a verdict keeps it, including `null`: the derivation is only the default.
  const stated = "actionRequired" in options;
  return {
    ...row,
    actionRequired: stated ? row.actionRequired : row.summary ? row.summary.actionRequired : null,
  };
}
