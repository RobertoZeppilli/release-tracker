import { describe, expect, it } from "vitest";
import { initialSummaryStatus } from "./initial-summary-status";

describe("initialSummaryStatus", () => {
  it("is pending for a featured or notable Release with notes, outside History", () => {
    expect(initialSummaryStatus({ significance: "featured", hasNotes: true, skip: false })).toBe("pending");
    expect(initialSummaryStatus({ significance: "notable", hasNotes: true, skip: false })).toBe("pending");
  });

  it("is skipped when the phase chose not to summarize it", () => {
    expect(initialSummaryStatus({ significance: "notable", hasNotes: true, skip: true })).toBe("skipped");
    expect(initialSummaryStatus({ significance: "preview", hasNotes: true, skip: true })).toBe("skipped");
  });

  it("is skipped for a digest Release", () => {
    expect(initialSummaryStatus({ significance: "digest", hasNotes: true, skip: false })).toBe("skipped");
  });

  it("is unavailable without Release Notes, whatever else applies", () => {
    expect(initialSummaryStatus({ significance: "featured", hasNotes: false, skip: false })).toBe("unavailable");
    expect(initialSummaryStatus({ significance: "digest", hasNotes: false, skip: true })).toBe("unavailable");
  });
});
