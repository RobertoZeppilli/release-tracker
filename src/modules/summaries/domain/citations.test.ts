import { describe, expect, it } from "vitest";
import { type Citation, citationSpans, locateCitation } from "./citations";

const notes = [
  "## Breaking changes", // line 1
  "", // line 2
  "The default value of `resolve.conditions` no longer includes the defaults.", // line 3
].join("\n");

// The page underlines `length` characters from `column` of `fromLine`: read it back from the notes.
function underlined(quote: string, citation: Citation): string {
  const lines = notes.split("\n").slice(citation.fromLine - 1, citation.toLine);
  return lines.join("\n").slice(citation.column, citation.column + citation.length);
}

describe("locateCitation", () => {
  it("locates a quote inside one line", () => {
    const quote = "`resolve.conditions` no longer includes the defaults";
    const citation = locateCitation(notes, quote);

    expect(citation).toMatchObject({ fromLine: 3, toLine: 3, column: 21 });
    expect(citation && underlined(quote, citation)).toBe(quote);
  });

  // "Nessuna invenzione" (docs/DECISIONI.md): a quote that is not in the notes gets no pointer.
  it("returns null for a quote the notes do not contain", () => {
    expect(locateCitation(notes, "Node 21 is no longer supported")).toBeNull();
  });

  it("spans the lines a multi-line quote covers", () => {
    const quote = "Breaking changes\n\nThe default value";
    const citation = locateCitation(notes, quote);

    expect(citation).toMatchObject({ fromLine: 1, toLine: 3, column: 3 });
    expect(citation && underlined(quote, citation)).toBe(quote);
  });
});

describe("citationSpans", () => {
  const lines = notes.split("\n");

  it("covers the quoted stretch of a single line", () => {
    const quote = "`resolve.conditions` no longer includes the defaults";
    const citation = locateCitation(notes, quote)!;

    expect(citationSpans(lines, citation)).toEqual([{ line: 3, start: 21, end: 73 }]);
  });

  // Read back: the spans joined by the line breaks the quote crossed give the quote again.
  it("splits a multi-line quote line by line", () => {
    const quote = "Breaking changes\n\nThe default value";
    const citation = locateCitation(notes, quote)!;
    const spans = citationSpans(lines, citation);

    expect(spans).toEqual([
      { line: 1, start: 3, end: 19 },
      { line: 2, start: 0, end: 0 },
      { line: 3, start: 0, end: 17 },
    ]);
    expect(spans.map((span) => lines[span.line - 1].slice(span.start, span.end)).join("\n")).toBe(quote);
  });
});
