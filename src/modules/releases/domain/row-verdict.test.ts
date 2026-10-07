import { describe, expect, it } from "vitest";
import type { SummaryStatus } from "./initial-summary-status";
import { rowVerdict } from "./row-verdict";

const content = {
  title: "Actions and the use API arrive.",
  keyPoints: [{ text: "one" }, { text: "two" }, { text: "three" }],
};

type Row = Parameters<typeof rowVerdict>[0];

function row(options: Partial<Row> = {}): Row {
  const base: Row = { summaryStatus: "ready", actionRequired: null, unjudged: false, summary: null, ...options };
  // A test that states a verdict keeps it, including `null`: the derivation is only the default.
  const stated = "actionRequired" in options;
  return { ...base, actionRequired: stated ? base.actionRequired : base.summary ? base.summary.actionRequired : null };
}

describe("rowVerdict", () => {
  it("names the breaking changes when the Summary asks for work", () => {
    const summary = { ...content, actionRequired: true, breakingChanges: [{ change: "a", migration: "b" }] };

    expect(rowVerdict(row({ summary }))).toEqual({
      tone: "action",
      label: "warning:",
      claim: "action required · 1 breaking change",
      notes: false,
    });
  });

  it("calls a Release safe only on a ready Summary that says so", () => {
    const summary = { ...content, actionRequired: false, breakingChanges: [] };

    expect(rowVerdict(row({ summary }))).toEqual({ tone: "ok", label: "ok:", claim: "safe to upgrade", notes: false });
  });

  it("says a Summary is there but could not judge, which is not the same as no Summary", () => {
    const summary = { ...content, actionRequired: false, breakingChanges: [] };

    expect(rowVerdict(row({ summary, actionRequired: null, unjudged: true }))).toEqual({
      tone: "muted",
      label: "note:",
      claim: "not enough notes to judge",
      notes: false,
    });
  });

  it("says the Summary is queued while it is still coming, and offers the notes meanwhile", () => {
    for (const summaryStatus of ["pending", "processing"] as const) {
      expect(rowVerdict(row({ summaryStatus }))).toEqual({
        tone: "muted",
        label: "pending:",
        claim: "summary queued",
        pending: true,
        notes: true,
      });
    }
  });

  // The rilievo this function was written for: the Dashboard collapsed `skipped`, `unavailable` and
  // `failed` into one line that said `read the release notes`, on a Release whose notes do not
  // exist. `unavailable` is exactly "no notes" (`initialSummaryStatus`), so it is the one state that
  // must not name them.
  it("never offers the notes of a Release that has none", () => {
    expect(rowVerdict(row({ summaryStatus: "unavailable" }))).toEqual({
      tone: "muted",
      label: "note:",
      claim: "no release notes to summarize",
      notes: false,
    });
  });

  it("offers the notes for every other state without a verdict, each in its own words", () => {
    const claims: [SummaryStatus, string][] = [
      ["skipped", "no summary for this older release"],
      ["failed", "summary unavailable"],
    ];

    for (const [summaryStatus, claim] of claims) {
      expect(rowVerdict(row({ summaryStatus }))).toEqual({
        tone: "muted",
        label: "note:",
        claim,
        notes: true,
      });
    }
    expect(rowVerdict(row({ summaryStatus: null }))).toEqual({
      tone: "muted",
      label: "note:",
      claim: "no summary",
      notes: true,
    });
  });

  // Both surfaces read this one function, so a state cannot read one way on the Dashboard and
  // another on the Technology page: there is nowhere left for a second vocabulary to live.
  it("gives every state a claim and a glyph", () => {
    const states: (SummaryStatus | null)[] = [null, "pending", "processing", "ready", "unavailable", "skipped", "failed"];

    for (const summaryStatus of states) {
      const verdict = rowVerdict(row({ summaryStatus }));
      expect(verdict.claim, `${summaryStatus} has a claim`).not.toBe("");
      expect(["action", "ok", "muted", "breaking"]).toContain(verdict.tone);
    }
  });
});
