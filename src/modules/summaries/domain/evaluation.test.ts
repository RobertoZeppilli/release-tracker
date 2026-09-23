import { describe, expect, it } from "vitest";
import { evaluateSummary, type ExpectedSummary } from "./evaluation";
import type { SummaryContent } from "./summary-content";

const notes = "Line one says `foo()` is removed.\nLine two is ordinary.";

function content(overrides: Partial<SummaryContent> = {}): SummaryContent {
  return {
    title: "A short title",
    actionRequired: true,
    keyPoints: [{ text: "one" }, { text: "two" }, { text: "three" }],
    breakingChanges: [{ change: "`foo()` is removed", migration: "call `bar()`", quote: "`foo()` is removed" }],
    ...overrides,
  };
}

const expected: ExpectedSummary = {
  actionRequired: true,
  breakingChanges: [{ id: "foo-removed", about: "foo() is gone", match: ["foo"] }],
};

describe("evaluateSummary", () => {
  it("counts an expected breaking change as found when every keyword appears", () => {
    const evaluation = evaluateSummary({ expected, content: content(), notes });

    expect(evaluation.found).toEqual(["foo-removed"]);
    expect(evaluation.missing).toEqual([]);
    expect(evaluation.unexpected).toEqual([]);
    expect(evaluation.actionRequiredMatches).toBe(true);
  });

  it("matches keywords case-insensitively across the change and its migration", () => {
    const withMigrationKeyword: ExpectedSummary = {
      actionRequired: true,
      breakingChanges: [{ id: "foo-removed", about: "foo() is gone", match: ["FOO", "BAR"] }],
    };

    const evaluation = evaluateSummary({ expected: withMigrationKeyword, content: content(), notes });

    expect(evaluation.found).toEqual(["foo-removed"]);
  });

  it("reports an expected breaking change nobody claimed as missing", () => {
    const evaluation = evaluateSummary({ expected, content: content({ breakingChanges: [], actionRequired: false }), notes });

    expect(evaluation.missing).toEqual(["foo-removed"]);
    expect(evaluation.actionRequiredMatches).toBe(false);
  });

  it("reports a claimed breaking change no expectation covers, with the state of its quote", () => {
    const claimed = content({
      breakingChanges: [
        { change: "`foo()` is removed", migration: "call `bar()`", quote: "`foo()` is removed" },
        { change: "the sky is falling", migration: "duck", quote: "nowhere in the notes" },
      ],
    });

    const evaluation = evaluateSummary({ expected, content: claimed, notes });

    expect(evaluation.unexpected).toEqual([{ change: "the sky is falling", quote: "invented" }]);
  });

  it("calls a quote invented when it is not in the notes verbatim, wherever it sits", () => {
    const invented = content({
      keyPoints: [{ text: "one", quote: "made up" }, { text: "two" }, { text: "three" }],
      breakingChanges: [{ change: "`foo()` is removed", migration: "call `bar()`", quote: "removed, shortened" }],
    });

    const evaluation = evaluateSummary({ expected, content: invented, notes });

    expect(evaluation.inventedQuotes).toEqual(["made up", "removed, shortened"]);
    expect(evaluation.quoted).toBe(0);
  });

  it("counts the quotes that do sit in the notes and the items left unquoted", () => {
    const evaluation = evaluateSummary({ expected, content: content(), notes });

    expect(evaluation.quoted).toBe(1);
    expect(evaluation.unquoted).toBe(3);
  });

  it("keeps the title length, so a run says how close the prompt sails to the 120 limit", () => {
    const evaluation = evaluateSummary({ expected, content: content(), notes });

    expect(evaluation.titleLength).toBe("A short title".length);
  });

  it("tolerates a borderline change the set allows without counting it as unexpected", () => {
    const withAllowed: ExpectedSummary = {
      ...expected,
      allowed: [{ id: "sky-falling", about: "the sky, allegedly", match: ["sky"] }],
    };
    const claimed = content({
      breakingChanges: [
        { change: "`foo()` is removed", migration: "call `bar()`" },
        { change: "the sky is falling", migration: "duck" },
      ],
    });

    const evaluation = evaluateSummary({ expected: withAllowed, content: claimed, notes });

    expect(evaluation.tolerated).toEqual(["sky-falling"]);
    expect(evaluation.unexpected).toEqual([]);
  });

  it("accepts both verdicts when the set says the Intervento richiesto reads either way", () => {
    const either: ExpectedSummary = { actionRequired: "either", breakingChanges: [] };

    const yes = evaluateSummary({ expected: either, content: content(), notes });
    const no = evaluateSummary({ expected: either, content: content({ actionRequired: false, breakingChanges: [] }), notes });

    expect([yes.actionRequiredMatches, no.actionRequiredMatches]).toEqual([true, true]);
  });

  it("matches a keyword against the whole expected claim only, never across two claims", () => {
    const two: ExpectedSummary = {
      actionRequired: true,
      breakingChanges: [{ id: "both", about: "foo and baz", match: ["foo", "baz"] }],
    };
    const claimed = content({
      breakingChanges: [
        { change: "`foo()` is removed", migration: "call `bar()`" },
        { change: "`baz()` is removed", migration: "call `bar()`" },
      ],
    });

    const evaluation = evaluateSummary({ expected: two, content: claimed, notes });

    expect(evaluation.missing).toEqual(["both"]);
  });
});
