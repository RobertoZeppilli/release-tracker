import { describe, expect, it } from "vitest";
import { parseSummaryOutput } from "./summary-output";

const valid = {
  title: "Environment API arrives as experimental, while defaults change for resolve conditions.",
  keyPoints: [
    { text: "The Environment API is experimental.", quote: "Environment API" },
    { text: "Node 21 is no longer supported." },
    { text: "More HTML elements are processed." },
  ],
  breakingChanges: [
    {
      change: "Custom `resolve.conditions` no longer include the defaults",
      migration: "Spread the exported defaults into your list.",
      quote: "no longer includes the defaults",
    },
  ],
  actionRequired: true,
};

function output(overrides: Record<string, unknown>): string {
  return JSON.stringify({ ...valid, ...overrides });
}

function reason(text: string): string {
  const result = parseSummaryOutput(text);
  if (result.ok) throw new Error("expected an invalid output");
  return result.reason;
}

describe("parseSummaryOutput", () => {
  it("accepts a valid output wrapped in a markdown code block", () => {
    const result = parseSummaryOutput(["```json", output({}), "```"].join("\n"));

    expect(result.ok).toBe(true);
  });

  it("accepts a valid output", () => {
    expect(parseSummaryOutput(JSON.stringify(valid))).toEqual({ ok: true, content: valid });
  });

  it("accepts a safe upgrade without breaking changes", () => {
    const safe = { ...valid, breakingChanges: [], actionRequired: false };
    expect(parseSummaryOutput(JSON.stringify(safe))).toEqual({ ok: true, content: safe });
  });

  // Issue #93: the `v7` third exit. The field is carried through to the stored content, because it
  // is what decides the verdict on read, and `valid` above shows a `v4` or `v6` output, which has no
  // such field, still parsing: the Summaries already paid for must keep working.
  it("keeps the judgement of the notes the model made", () => {
    const unjudgeable = { ...valid, breakingChanges: [], actionRequired: false, notesJudgeable: false };
    expect(parseSummaryOutput(JSON.stringify(unjudgeable))).toEqual({ ok: true, content: unjudgeable });
  });

  it("rejects a judgement of the notes that is not a boolean", () => {
    expect(reason(output({ notesJudgeable: "no" }))).toContain("notesJudgeable");
  });

  // Issue #56: the longest of the 4 titles the first real batch produced over the old limit of 120.
  // They were sound in everything else, and the prompt still asks for 120: the margin is there so
  // that the few characters the model goes over do not throw away a Summary that has been paid for.
  it("accepts the longest title of the first real batch, 126 characters", () => {
    const title =
      "pnpm 11.27.0 isolates registry metadata caches per URL path, adds global `nodeDownloadMirrors`, and fixes a store symlink flaw";

    expect(title).toHaveLength(126);
    expect(parseSummaryOutput(output({ title })).ok).toBe(true);
  });

  it("rejects a title over 140 characters", () => {
    expect(reason(output({ title: "x".repeat(141) }))).toMatch(/title/);
  });

  it("accepts a title of exactly 140 characters", () => {
    expect(parseSummaryOutput(output({ title: "x".repeat(140) })).ok).toBe(true);
  });

  it("rejects fewer than 3 key points", () => {
    const point = (text: string) => ({ text });
    expect(reason(output({ keyPoints: ["one", "two"].map(point) }))).toMatch(/keyPoints/);
  });

  // Issue #93, measured on the `v7` run of the evaluation set: `vite 8.2.2` is 114 characters of
  // notes pointing at a changelog, the model answered with the one point they hold, and the floor of
  // 3 threw the Summary away. Asking for three there is asking it to invent.
  it("accepts a single key point when the model says the notes could not be judged", () => {
    const thin = {
      keyPoints: [{ text: "The notes only point to the external CHANGELOG.md for details." }],
      breakingChanges: [],
      actionRequired: false,
      notesJudgeable: false,
    };
    expect(parseSummaryOutput(output(thin)).ok).toBe(true);
  });

  it("keeps the floor of 3 on notes the model judged", () => {
    const thin = { keyPoints: [{ text: "one" }], breakingChanges: [], actionRequired: false };
    expect(reason(output({ ...thin, notesJudgeable: true }))).toMatch(/keyPoints/);
    expect(reason(output(thin))).toMatch(/keyPoints/);
  });

  // Paid for and otherwise sound: the sixth key point goes, not the Summary.
  it("keeps the first 5 key points when the model answers with more", () => {
    const point = (text: string) => ({ text });
    const parsed = parseSummaryOutput(output({ keyPoints: ["1", "2", "3", "4", "5", "6"].map(point) }));

    expect(parsed.ok && parsed.content.keyPoints.map((item) => item.text)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("rejects a breaking change without a migration", () => {
    expect(reason(output({ breakingChanges: [{ change: "Node 18 is dropped", migration: " " }] }))).toMatch(/migration/);
    expect(reason(output({ breakingChanges: [{ change: "Node 18 is dropped" }] }))).toMatch(/migration/);
  });

  // The `.refine()` is the last word and has to be: a conditional rule like this one is not
  // expressible in the JSON Schema the request carries, so nothing on the API side enforces it.
  it("rejects an action required verdict that does not match the breaking changes", () => {
    expect(reason(output({ actionRequired: false }))).toMatch(/actionRequired/);
    expect(reason(output({ breakingChanges: [] }))).toMatch(/actionRequired/);
  });

  // The quote is how a claim is traced back to the notes: optional, but never empty when present.
  it("rejects an empty quote", () => {
    expect(reason(output({ keyPoints: [{ text: "one", quote: " " }, { text: "two" }, { text: "three" }] }))).toMatch(/quote/);
  });

  it("rejects text that is not JSON", () => {
    expect(reason("Here is the summary: {")).toMatch(/not JSON/);
  });
});
