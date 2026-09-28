import { describe, expect, it } from "vitest";
import type { DashboardRelease } from "../domain/build-dashboard";
import { pageVerdict, rowVerdict, weekRange } from "./dashboard-copy";

describe("pageVerdict", () => {
  it("says nothing needs action when no featured Release asks for work", () => {
    expect(pageVerdict({ needsAction: 0, safe: 3 })).toEqual({
      tone: "ok",
      label: "ok:",
      claim: "nothing needs action",
    });
  });

  it("counts the Releases that need action, in the singular when there is one", () => {
    expect(pageVerdict({ needsAction: 1, safe: 0 }).claim).toBe("1 needs action");
    expect(pageVerdict({ needsAction: 2, safe: 1 })).toEqual({
      tone: "action",
      label: "warning:",
      claim: "2 need action",
    });
  });
});

function release(options: Partial<DashboardRelease> = {}): DashboardRelease {
  return {
    slug: "react",
    version: "19.0.0",
    significance: "featured",
    publishedAt: new Date("2024-12-05T00:00:00Z"),
    summaryStatus: "ready",
    summary: null,
    ...options,
  };
}

const content = {
  title: "Actions and the use API arrive.",
  keyPoints: [{ text: "one" }, { text: "two" }, { text: "three" }],
};

describe("rowVerdict", () => {
  it("names the breaking changes when the Summary asks for work", () => {
    const summary = { ...content, actionRequired: true, breakingChanges: [{ change: "a", migration: "b" }] };

    expect(rowVerdict(release({ summary }))).toEqual({
      tone: "action",
      label: "warning:",
      claim: "action required · 1 breaking change",
    });
  });

  it("calls a Release safe only on a ready Summary that says so", () => {
    const summary = { ...content, actionRequired: false, breakingChanges: [] };

    expect(rowVerdict(release({ summary }))).toEqual({ tone: "ok", label: "ok:", claim: "safe to upgrade" });
  });

  it("says the Summary is queued while it is still coming", () => {
    expect(rowVerdict(release({ summaryStatus: "pending" }))).toEqual({
      tone: "muted",
      label: "pending:",
      claim: "summary queued",
      pending: true,
    });
  });

  it("falls back to the notes when there will be no Summary", () => {
    expect(rowVerdict(release({ summaryStatus: "unavailable" }))).toEqual({
      tone: "muted",
      label: "note:",
      claim: "no summary · read the release notes",
    });
  });
});

describe("weekRange", () => {
  it("names the month once when the week stays inside it", () => {
    expect(weekRange(new Date("2024-12-02T00:00:00Z"), new Date("2024-12-08T00:00:00Z"))).toBe("Dec 2 to 8");
  });

  it("names both months when the week crosses one, in UTC", () => {
    expect(weekRange(new Date("2024-11-25T00:00:00Z"), new Date("2024-12-01T00:00:00Z"))).toBe("Nov 25 to Dec 1");
  });

  it("names both months when the week crosses the year", () => {
    expect(weekRange(new Date("2024-12-30T00:00:00Z"), new Date("2025-01-05T00:00:00Z"))).toBe("Dec 30 to Jan 5");
  });
});
