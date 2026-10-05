import { describe, expect, it } from "vitest";
import { notesHead } from "./notes-judgement";
import { judge } from "./summary-verdict";

const POINTER = notesHead("Please refer to [CHANGELOG.md](https://example.com/CHANGELOG.md) for details.");
const DESCRIBED = notesHead("- feat: add `$replicas` reference");

describe("judge", () => {
  it("withdraws a safe verdict the notes cannot support", () => {
    expect(judge(false, POINTER)).toEqual({ actionRequired: null, unjudged: true });
  });

  it("keeps a safe verdict the notes support", () => {
    expect(judge(false, DESCRIBED)).toEqual({ actionRequired: false, unjudged: false });
  });

  // A listed breaking change is a fact from the notes, so thin notes cannot take it back: the model
  // is told never to infer one, which is the rule that produced the silence being corrected here.
  it("never withdraws an action required, whatever the notes look like", () => {
    expect(judge(true, POINTER)).toEqual({ actionRequired: true, unjudged: false });
  });

  it("leaves a Release with no Summary as it was, so the two silences stay distinguishable", () => {
    expect(judge(null, POINTER)).toEqual({ actionRequired: null, unjudged: false });
    expect(judge(null, null)).toEqual({ actionRequired: null, unjudged: false });
  });

  it("withdraws a safe verdict on a Release with no notes at all", () => {
    expect(judge(false, null)).toEqual({ actionRequired: null, unjudged: true });
  });
});
