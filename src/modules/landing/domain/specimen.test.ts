import { describe, expect, it } from "vitest";
import { caretWidth, CARET_WIDTHS } from "@/modules/summaries";
import { CITATION, citedLine, citedSpan, EXCERPT, SPECIMEN } from "./specimen";

// DESIGN.md forbids inventing a Release, a count or a number on the landing, and the landing's whole
// argument is that a claim and the line it rests on can be checked against each other. What cannot
// be tested here is whether React really published these lines; what can, and is, is that the page
// does not contradict itself: the quote is a stretch of the line it names, the cited stretch is a
// stretch of the quote, and the caret row is drawable at every width it is shown at.

describe("the bench specimen", () => {
  it("quotes the line it names, word for word", () => {
    const line = citedLine();

    expect(line).toBeDefined();
    expect(line?.text).toContain(CITATION.quote);
  });

  it("cites a stretch of its own quote", () => {
    const span = citedSpan(CITATION.quote, CITATION.cited);

    expect(span).not.toBeNull();
    expect(CITATION.quote.slice(span?.start, span?.end)).toBe(CITATION.cited);
  });

  it("cites nothing when the stretch is not in the quote, rather than guessing a span", () => {
    expect(citedSpan(CITATION.quote, "will now be loudly ignored")).toBeNull();
  });

  it("holds a quote short enough for the caret row at every width a caret row exists at", () => {
    // `caretWidth` answers with the narrowest viewport the quote still fits one line at. The
    // narrowest there is means the carets are shown wherever DESIGN.md allows them, and never sit
    // under the wrong words.
    expect(caretWidth(CITATION.quote.length)).toBe(CARET_WIDTHS[0]);
  });

  it("shows a window of consecutive lines, at their own numbers", () => {
    const numbers = EXCERPT.map((line) => line.number);

    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(numbers.at(-1)! - numbers[0]!).toBe(numbers.length - 1);
    expect(numbers).toContain(CITATION.line);
  });

  it("shows fewer lines than the notes it says it read", () => {
    expect(EXCERPT.length).toBeLessThan(SPECIMEN.totalLines);
    expect(EXCERPT.at(-1)!.number).toBeLessThanOrEqual(SPECIMEN.totalLines);
  });
});
