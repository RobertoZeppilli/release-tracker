import { describe, expect, it } from "vitest";
import { declared, release, technology } from "../domain/fixtures";
import type { Standing, StandingRow } from "../domain/standing";
import {
  barShare,
  declarationNote,
  hushClaim,
  hushSpan,
  pageVerdict,
  standingWords,
  totalsRows,
} from "./dashboard-copy";

function row(options: Partial<StandingRow> = {}): StandingRow {
  return {
    technology: technology("next", "Next.js", declared("15.0.0")),
    latest: "15.1.0",
    declared: "15.0.0",
    distance: 4,
    needsAction: 0,
    safe: 0,
    missing: 0,
    ...options,
  };
}

function standing(options: Partial<Standing> = {}): Standing {
  return { rows: [], scale: 7, behind: 22, missing: 0, since: new Date("2026-09-12T00:00:00Z"), ...options };
}

describe("pageVerdict", () => {
  it("counts Releases and names the number", () => {
    expect(pageVerdict({ needsAction: 2, safe: 4 })).toMatchObject({ tone: "action", claim: "2 need action" });
    expect(pageVerdict({ needsAction: 1, safe: 0 })).toMatchObject({ claim: "1 needs action" });
  });

  it("says nothing needs action only where something was judged", () => {
    expect(pageVerdict({ needsAction: 0, safe: 3 })).toMatchObject({ tone: "ok", claim: "nothing needs action" });
    expect(pageVerdict(null)).toMatchObject({ tone: "muted", claim: "nothing judged yet" });
  });
});

describe("standingWords", () => {
  it("takes the ink where the row needs action, whatever its Distance", () => {
    expect(standingWords(row({ needsAction: 1, distance: 7 }))).toEqual({ words: "1 needs action", action: true });
    expect(standingWords(row({ needsAction: 2 }))).toEqual({ words: "2 need action", action: true });
  });

  it("names the declared Version in use it counts from", () => {
    expect(standingWords(row()).words).toBe("4 behind 15.0.0");
  });

  it("says a row with no declaration has no Distance, instead of inventing one", () => {
    expect(standingWords(row({ distance: null, declared: null })).words).toBe("no version declared");
  });

  it("reads `up to date` at a Distance of zero", () => {
    expect(standingWords(row({ distance: 0 })).words).toBe("up to date");
  });
});

describe("barShare", () => {
  it("is this row's Distance as a share of the longest", () => {
    expect(barShare(row({ distance: 7 }), 7)).toBe(100);
    expect(barShare(row({ distance: 5 }), 7)).toBe(71);
    expect(barShare(row({ distance: 0 }), 7)).toBe(0);
  });

  it("draws nothing where there is no Distance and nothing where there is no lane", () => {
    expect(barShare(row({ distance: null }), 7)).toBeNull();
    expect(barShare(row(), null)).toBeNull();
  });
});

describe("totalsRows", () => {
  it("counts the whole and names the oldest declaration under it", () => {
    expect(totalsRows(standing())).toEqual([
      { label: "releases behind in all", value: "22" },
      { label: "oldest version declared", value: "2026-09-12" },
    ]);
  });

  it("counts the Releases without a verdict apart", () => {
    expect(totalsRows(standing({ behind: 1, missing: 3 }))).toEqual([
      { label: "releases behind in all", value: "1" },
      { label: "without a verdict", value: "3" },
      { label: "oldest version declared", value: "2026-09-12" },
    ]);
  });

  it("has no total to print where nobody declared a Version in use", () => {
    expect(totalsRows(standing({ since: null, behind: 0 }))).toEqual([]);
  });
});

describe("the quiet end of the Stream", () => {
  it("spans the weeks it folds, and names one week as one", () => {
    const week = (number: number, start: string) => ({
      key: `2024-W${number}`,
      week: { year: 2024, week: number },
      start: new Date(`${start}T00:00:00Z`),
      end: new Date(`${start}T00:00:00Z`),
      rows: [],
    });

    expect(hushSpan([week(49, "2024-12-02"), week(46, "2024-11-11")])).toBe("weeks 46 to 49");
    expect(hushSpan([week(49, "2024-12-02")])).toBe("week 49");
    expect(hushSpan([])).toBe("");
  });

  it("says how much is folded in and that none of it asks anything", () => {
    expect(hushClaim(23)).toBe("23 more releases, none asking anything");
    expect(hushClaim(1)).toBe("1 more release, not asking anything");
  });
});

describe("declarationNote", () => {
  const next = technology("next", "Next.js", declared("15.0.0"));

  it("cites the declaration where the Release is newer than it", () => {
    expect(declarationNote(next, release({ slug: "next", version: "15.1.0" }))).toBe("you are on 15.0.0");
  });

  // The count is the Standing's: a Stream row that counted from the declaration would be the old
  // contradiction rebuilt one column to the right (DESIGN.md, Stream Row).
  it("says nothing where there is no declaration, or where the reader is already past the Release", () => {
    expect(declarationNote(technology("node", "Node.js"), release({ slug: "node", version: "23.4.0" }))).toBeNull();
    expect(declarationNote(next, release({ slug: "next", version: "15.0.0" }))).toBeNull();
    expect(declarationNote(next, release({ slug: "next", version: "14.2.0" }))).toBeNull();
  });
});
