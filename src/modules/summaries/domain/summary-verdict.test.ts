import { describe, expect, it } from "vitest";
import { notesHead } from "./notes-judgement";
import { judge } from "./summary-verdict";

const POINTER = notesHead("Please refer to [CHANGELOG.md](https://example.com/CHANGELOG.md) for details.");
const DESCRIBED = notesHead("- feat: add `$replicas` reference");

// A Summary from a prompt before `v7`: it says nothing about whether the notes were judgeable.
const safe = { actionRequired: false };
const breaking = { actionRequired: true };

describe("judge", () => {
  it("withdraws a safe verdict the notes cannot support", () => {
    expect(judge(safe, POINTER)).toEqual({ actionRequired: null, unjudged: true });
  });

  it("keeps a safe verdict the notes support", () => {
    expect(judge(safe, DESCRIBED)).toEqual({ actionRequired: false, unjudged: false });
  });

  // A listed breaking change is a fact from the notes, so thin notes cannot take it back: the model
  // is told never to infer one, which is the rule that produced the silence being corrected here.
  it("never withdraws an action required, whatever the notes look like", () => {
    expect(judge(breaking, POINTER)).toEqual({ actionRequired: true, unjudged: false });
  });

  it("leaves a Release with no Summary as it was, so the two silences stay distinguishable", () => {
    expect(judge(null, POINTER)).toEqual({ actionRequired: null, unjudged: false });
    expect(judge(null, null)).toEqual({ actionRequired: null, unjudged: false });
  });

  it("withdraws a safe verdict on a Release with no notes at all", () => {
    expect(judge(safe, null)).toEqual({ actionRequired: null, unjudged: true });
  });

  // Issue #93: from `v7` the model answers the question itself, having read the whole notes, and the
  // heuristic only ever saw the first 400 characters.
  describe("when the Summary says whether the notes were judgeable", () => {
    it("withdraws a safe verdict the model called unjudgeable, whatever the head looks like", () => {
      expect(judge({ actionRequired: false, notesJudgeable: false }, DESCRIBED)).toEqual({
        actionRequired: null,
        unjudged: true,
      });
    });

    it("keeps a safe verdict the model stands behind, where the heuristic would have withdrawn it", () => {
      expect(judge({ actionRequired: false, notesJudgeable: true }, POINTER)).toEqual({
        actionRequired: false,
        unjudged: false,
      });
      expect(judge({ actionRequired: false, notesJudgeable: true }, null)).toEqual({
        actionRequired: false,
        unjudged: false,
      });
    });

    it("still never withdraws an action required", () => {
      expect(judge({ actionRequired: true, notesJudgeable: false }, POINTER)).toEqual({
        actionRequired: true,
        unjudged: false,
      });
    });
  });
});
