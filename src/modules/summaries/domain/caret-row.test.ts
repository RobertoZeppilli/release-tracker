import { describe, expect, it } from "vitest";
import { CARET_WIDTHS, caretWidth } from "./caret-row";

describe("caretWidth", () => {
  it("keeps the caret row at every width for a quote that fits the narrowest column", () => {
    expect(caretWidth(64)).toBe(641);
    expect(caretWidth(0)).toBe(641);
  });

  it("raises the width a longer quote needs", () => {
    expect(caretWidth(65)).toBe(768);
    expect(caretWidth(79)).toBe(768);
    expect(caretWidth(80)).toBe(900);
    expect(caretWidth(95)).toBe(900);
    expect(caretWidth(96)).toBe(1024);
    expect(caretWidth(100)).toBe(1024);
  });

  it("gives up on a quote no width fits, so the underline carries it", () => {
    // The `react/19.0.0` line that widened the page by 1503px in the measurement of issue #62.
    expect(caretWidth(167)).toBeNull();
    expect(caretWidth(101)).toBeNull();
  });

  it("never grows the answer as the quote grows", () => {
    const widths = Array.from({ length: 200 }, (_, length) => caretWidth(length));
    const rank = (width: number | null) => (width === null ? CARET_WIDTHS.length : CARET_WIDTHS.findIndex((listed) => listed === width));
    for (let index = 1; index < widths.length; index += 1) {
      expect(rank(widths[index] ?? null)).toBeGreaterThanOrEqual(rank(widths[index - 1] ?? null));
    }
  });
});
