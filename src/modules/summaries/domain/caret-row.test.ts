import { describe, expect, it } from "vitest";
import { CARET_WIDTHS, caretWidth, fits } from "./caret-row";

describe("caretWidth", () => {
  // Measured in Chrome on the production pages, at each of these widths: the column holds 59, 73, 88
  // and 93 characters, and `fits` keeps one back. A change here means the type or the column moved.
  it("holds the budget measured on the live font", () => {
    expect(CARET_WIDTHS).toEqual([641, 768, 900, 1024]);
    expect(CARET_WIDTHS.map(fits)).toEqual([58, 72, 87, 92]);
  });

  it("keeps the caret row at every width for a quote that fits the narrowest column", () => {
    expect(caretWidth(58)).toBe(641);
    expect(caretWidth(0)).toBe(641);
  });

  it("raises the width a longer quote needs", () => {
    expect(caretWidth(59)).toBe(768);
    expect(caretWidth(72)).toBe(768);
    expect(caretWidth(73)).toBe(900);
    expect(caretWidth(87)).toBe(900);
    expect(caretWidth(88)).toBe(1024);
    expect(caretWidth(92)).toBe(1024);
  });

  it("gives up on a quote no width fits, so the underline carries it", () => {
    // The `react/19.0.0` line that widened the page by 1503px in the measurement of issue #62.
    expect(caretWidth(167)).toBeNull();
    expect(caretWidth(93)).toBeNull();
    // The 79-character lines that still overflowed at 768px after the first fix: angular 22.0.0,
    // deno 2.0.0 and express 5.0.0 all cited a line of exactly that length.
    expect(caretWidth(79)).toBe(900);
  });

  it("never grows the answer as the quote grows", () => {
    const widths = Array.from({ length: 200 }, (_, length) => caretWidth(length));
    const rank = (width: number | null) => (width === null ? CARET_WIDTHS.length : CARET_WIDTHS.findIndex((listed) => listed === width));
    for (let index = 1; index < widths.length; index += 1) {
      expect(rank(widths[index] ?? null)).toBeGreaterThanOrEqual(rank(widths[index - 1] ?? null));
    }
  });
});
