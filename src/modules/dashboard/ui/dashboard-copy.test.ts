import { describe, expect, it } from "vitest";
import type { BehindStanding, DashboardRelease } from "../domain/build-dashboard";
import { behindLine, inUseTotalsLine, pageVerdict, rowVerdict, weekRange } from "./dashboard-copy";

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

const DECLARED = new Date("2026-09-12T00:00:00Z");

function standing(counts: Partial<BehindStanding["counts"]> = {}): BehindStanding {
  return {
    version: "6.0.0",
    declaredAt: DECLARED,
    to: "6.2.1",
    counts: { total: 0, featured: 0, notable: 0, digest: 0, actionRequired: 0, safe: 0, missing: 0, ...counts },
  };
}

describe("behindLine", () => {
  it("always names the day the declaration was made, because nothing ever checks it", () => {
    expect(behindLine(standing({ total: 3, actionRequired: 1 }))).toBe(
      "in use 6.0.0 since 2026-09-12 · 3 releases behind 6.2.1 · 1 needs action",
    );
  });

  it("counts what has no Summary apart, as neither safe nor needing action", () => {
    expect(behindLine(standing({ total: 2, missing: 2 }))).toBe(
      "in use 6.0.0 since 2026-09-12 · 2 releases behind 6.2.1 · 2 to check",
    );
  });

  it("says where the declaration stands when there is nothing after it", () => {
    expect(behindLine({ ...standing(), version: "6.2.1" })).toBe("in use 6.2.1 since 2026-09-12 · already on 6.2.1");
  });
});

describe("inUseTotalsLine", () => {
  it("names the oldest declaration, so the total says how stale it may be", () => {
    expect(inUseTotalsLine({ declared: 3, behind: 9, needsAction: 2, since: DECLARED }, 7)).toBe(
      "In use on 3 of 7: 9 releases behind · 2 need action · oldest declared 2026-09-12.",
    );
  });

  it("leaves the action clause out when no Release asks for work", () => {
    expect(inUseTotalsLine({ declared: 1, behind: 0, needsAction: 0, since: DECLARED }, 1)).toBe(
      "In use on 1 of 1: all up to date · oldest declared 2026-09-12.",
    );
  });
});
