// Where a Summary's verbatim quote sits in the release notes, so the page can point at it.
// Lines are 1-based, like the line numbers the notes are rendered with; `column` is 0-based.
export type Citation = { fromLine: number; toLine: number; column: number; length: number };

// The Summary cites the notes verbatim and the line numbers are derived here, never asked of the
// model: a quote that is not in the notes was invented, and an invented one gets no pointer.
export function locateCitation(notes: string, quote: string): Citation | null {
  // Release Notes from GitHub carry CRLF line endings and a quote copied out of them carries them
  // too, while the page renders the notes one line at a time, joined with LF. Both sides are
  // normalized here, so a quote that spans lines is still found verbatim and the offsets stay those
  // of the text shown. `noteLines` does the same normalization.
  notes = lf(notes);
  quote = lf(quote);
  const at = notes.indexOf(quote);
  if (at === -1) return null;
  const before = notes.slice(0, at);
  const fromLine = before.split("\n").length;
  return {
    fromLine,
    toLine: fromLine + quote.split("\n").length - 1,
    column: at - (before.lastIndexOf("\n") + 1),
    length: quote.length,
  };
}

const lf = (text: string): string => text.replace(/\r\n?/g, "\n");

// The stretch of each cited line the quote covers, as `[start, end)` offsets into that line, so the
// page can underline it. A quote that spans lines carries a newline per line break, counted here.
export type CitedSpan = { line: number; start: number; end: number };

export function citationSpans(lines: string[], citation: Citation): CitedSpan[] {
  const spans: CitedSpan[] = [];
  let remaining = citation.length;
  for (let line = citation.fromLine; line <= citation.toLine && remaining > 0; line += 1) {
    const text = lines[line - 1] ?? "";
    const start = line === citation.fromLine ? citation.column : 0;
    const end = Math.min(text.length, start + remaining);
    spans.push({ line, start, end });
    remaining -= end - start + 1;
  }
  return spans;
}
