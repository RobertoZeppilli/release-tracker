import { describe, expect, it } from "vitest";
import { CARET_WIDTHS, caretWidth, fits } from "./caret-row";

describe("caretWidth", () => {
  // The budget is `floor((col - 70.5) / 9) - 1` on a column of `min(1192px, 100vw - 48px)`: 9px is
  // the advance measured in Chrome on the live font, 70.5px the 5ch gutter plus its 1.5ch of padding
  // plus the 12px on the right. Read the other way it gives the viewport a quote of N characters
  // survives down to, which is what the mock stamps on its wells: 920px for 88 characters, 866 for 82
  // and 848 for 80. A change here means the type or the column moved.
  it("holds the budget measured on the live font", () => {
    expect(CARET_WIDTHS).toEqual([641, 768, 900, 1024, 1240]);
    expect(CARET_WIDTHS.map(fits)).toEqual([57, 71, 85, 99, 123]);
  });

  it("keeps the caret row at every width for a quote that fits the narrowest column", () => {
    expect(caretWidth(57)).toBe(641);
    expect(caretWidth(0)).toBe(641);
  });

  it("raises the width a longer quote needs", () => {
    expect(caretWidth(58)).toBe(768);
    expect(caretWidth(71)).toBe(768);
    expect(caretWidth(72)).toBe(900);
    expect(caretWidth(85)).toBe(900);
    expect(caretWidth(86)).toBe(1024);
    expect(caretWidth(99)).toBe(1024);
    expect(caretWidth(100)).toBe(1240);
    expect(caretWidth(123)).toBe(1240);
  });

  it("gives up on a quote no width fits, so the underline carries it", () => {
    // The `react/19.0.0` line that widened the page by 1503px in the measurement of issue #62.
    expect(caretWidth(167)).toBeNull();
    expect(caretWidth(124)).toBeNull();
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
