import { describe, expect, it } from "vitest";
import type { BehindStanding, DashboardRelease } from "../domain/build-dashboard";
import {
  behindLine,
  inUseCaption,
  inUseRows,
  pageVerdict,
  quietNote,
  rowVerdict,
  weekRange,
  windowCaption,
  windowRows,
} from "./dashboard-copy";

describe("pageVerdict", () => {
  it("says nothing needs action when no featured Release asks for work", () => {
    expect(pageVerdict({ needsAction: 0, safe: 3 })).toEqual({
      tone: "ok",
      label: "ok:",
      claim: "nothing needs action",
    });
  });

  // Issue #94: with nothing it can judge, the page says so instead of reassuring.
  it("gives no verdict when there is nothing to judge", () => {
    expect(pageVerdict(null)).toEqual({ tone: "muted", label: "note:", claim: "nothing here can be judged yet" });
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
  const row: DashboardRelease = {
    slug: "react",
    version: "19.0.0",
    significance: "featured",
    publishedAt: new Date("2024-12-05T00:00:00Z"),
    summaryStatus: "ready",
    actionRequired: null,
    unjudged: false,
    summary: null,
    ...options,
  };
  // A test that states a verdict keeps it, including `null`: the derivation is only the default.
  const stated = "actionRequired" in options;
  return { ...row, actionRequired: stated ? row.actionRequired : row.summary ? row.summary.actionRequired : null };
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

  it("says a Summary is there but could not judge, which is not the same as no Summary", () => {
    const summary = { ...content, actionRequired: false, breakingChanges: [] };
    const row = release({ summary, actionRequired: null, unjudged: true });

    expect(rowVerdict(row)).toEqual({ tone: "muted", label: "note:", claim: "not enough notes to judge" });
    expect(rowVerdict(release({ summary: null }))).toEqual({ tone: "muted", label: "note:", claim: "no summary · read the release notes" });
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
    counts: { total: 0, featured: 0, notable: 0, digest: 0, actionRequired: 0, safe: 0, missing: 0, unjudged: 0, ...counts },
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

describe("inUseRows", () => {
  it("names the oldest declaration, so the total says how stale it may be", () => {
    expect(inUseCaption({ declared: 3, behind: 9, needsAction: 2, since: DECLARED }, 7)).toBe("version in use · 3 of 7");
    expect(inUseRows({ declared: 3, behind: 9, needsAction: 2, since: DECLARED })).toEqual([
      { label: "releases behind", value: "9" },
      { label: "need action", value: "2" },
      { label: "oldest declared", value: "2026-09-12" },
    ]);
  });

  it("leaves the action row out when no Release asks for work, and counts in the singular", () => {
    expect(inUseRows({ declared: 1, behind: 1, needsAction: 1, since: DECLARED })).toEqual([
      { label: "release behind", value: "1" },
      { label: "needs action", value: "1" },
      { label: "oldest declared", value: "2026-09-12" },
    ]);
    expect(inUseRows({ declared: 1, behind: 0, needsAction: 0, since: DECLARED })).toEqual([
      { label: "releases behind", value: "0" },
      { label: "oldest declared", value: "2026-09-12" },
    ]);
  });
});

const COUNTS = { technologies: 7, featured: 3, featuredNeedsAction: 0, notable: 4, previews: 2, digest: 23 };

describe("windowRows", () => {
  it("names the window and how many Technologies it covers", () => {
    expect(windowCaption(7)).toBe("last 30 days · 7 technologies");
    expect(windowCaption(1)).toBe("last 30 days · 1 technology");
  });

  it("links a count only where its section exists, and Spotlight always exists", () => {
    const rows = windowRows({ ...COUNTS, featured: 0, notable: 0 });

    expect(rows.map(({ key, value, href, linked }) => ({ key, value, href, linked }))).toEqual([
      { key: "featured", value: 0, href: "#spotlight", linked: true },
      { key: "notable", value: 0, href: "#latest", linked: false },
      { key: "previews", value: 2, href: "#previews", linked: true },
      { key: "digest", value: 23, href: "#digest", linked: true },
    ]);
  });

  // Issue #94: the verdict above counts the Version in use too, so the narrower number has to say
  // its own scope where it stands, which is inside the `featured` row.
  it("keeps the action count attached to featured", () => {
    expect(windowRows({ ...COUNTS, featuredNeedsAction: 2 })[0].note).toEqual({ value: 2, words: "need action" });
    expect(windowRows({ ...COUNTS, featuredNeedsAction: 1 })[0].note).toEqual({ value: 1, words: "needs action" });
    expect(windowRows(COUNTS)[0].note).toBeNull();
  });

  it("names a single preview in the singular", () => {
    expect(windowRows({ ...COUNTS, previews: 1 })[2].label).toBe("preview");
    expect(windowRows(COUNTS)[2].label).toBe("previews");
  });
});

describe("quietNote", () => {
  it("counts the followed Technologies with nothing featured, once for the whole group", () => {
    expect(quietNote(4, 7)).toBe("4 of the 7 you follow had nothing featured");
  });
});
