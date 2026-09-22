import { describe, expect, it } from "vitest";
import { initialSummaryStatus } from "./initial-summary-status";

describe("initialSummaryStatus", () => {
  it("is pending for a featured or notable Release with notes, outside History", () => {
    expect(initialSummaryStatus({ significance: "featured", hasNotes: true, history: false })).toBe("pending");
    expect(initialSummaryStatus({ significance: "notable", hasNotes: true, history: false })).toBe("pending");
  });

  it("is skipped for an imported Release in History", () => {
    expect(initialSummaryStatus({ significance: "notable", hasNotes: true, history: true })).toBe("skipped");
    expect(initialSummaryStatus({ significance: "preview", hasNotes: true, history: true })).toBe("skipped");
  });

  it("is skipped for a digest Release", () => {
    expect(initialSummaryStatus({ significance: "digest", hasNotes: true, history: false })).toBe("skipped");
  });

  it("is unavailable without Release Notes, whatever else applies", () => {
    expect(initialSummaryStatus({ significance: "featured", hasNotes: false, history: false })).toBe("unavailable");
    expect(initialSummaryStatus({ significance: "digest", hasNotes: false, history: true })).toBe("unavailable");
  });
});
