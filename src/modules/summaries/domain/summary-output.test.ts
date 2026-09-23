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

  it("rejects a title over 120 characters", () => {
    expect(reason(output({ title: "x".repeat(121) }))).toMatch(/title/);
  });

  it("accepts a title of exactly 120 characters", () => {
    expect(parseSummaryOutput(output({ title: "x".repeat(120) })).ok).toBe(true);
  });

  it("rejects fewer than 3 or more than 5 key points", () => {
    const point = (text: string) => ({ text });
    expect(reason(output({ keyPoints: ["one", "two"].map(point) }))).toMatch(/keyPoints/);
    expect(reason(output({ keyPoints: ["1", "2", "3", "4", "5", "6"].map(point) }))).toMatch(/keyPoints/);
  });

  it("rejects a breaking change without a migration", () => {
    expect(reason(output({ breakingChanges: [{ change: "Node 18 is dropped", migration: " " }] }))).toMatch(/migration/);
    expect(reason(output({ breakingChanges: [{ change: "Node 18 is dropped" }] }))).toMatch(/migration/);
  });

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
