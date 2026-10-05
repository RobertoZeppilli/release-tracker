// A quote well shows one line of the Release Notes, and those notes are markdown: a line arrives
// with its list dash, its literal backticks and its links written out in full. Rendering it raw made
// the proof of the product harder to read than the prose explaining it (issue #84), so the line is
// cleaned here, for rendering only.
//
// ⚠️ The stored quote is never touched. The verbatim check in `summary-prompt.ts` and the one that
// discards a quote not found in the notes both depend on the exact text, and the Source View below
// the diagnostic keeps showing the line character for character. That panel is where a reader
// compares with the original, which is what its line numbers are for.
//
// Because the cited stretch arrives as `[start, end)` offsets into the raw line, cleaning has to
// carry those offsets across: every piece knows whether it is cited, and the rendered offsets come
// back out for the caret row, whose `^` run and hidden pad are both measured in rendered characters.

export type QuotePiece = {
  text: string;
  // Set on a span that was written between backticks: rendered with the Inline Code token.
  code?: true;
  // Set on the label of a markdown link: rendered as a link to this address.
  href?: string;
  cited: boolean;
};

export type RenderedQuote = {
  pieces: QuotePiece[];
  // The rendered line and the cited stretch inside it, all in rendered characters: what the caret
  // row has to count, and what decides whether the quote still fits on one line.
  length: number;
  start: number;
  end: number;
};

// A token of the raw line: what it renders as, and the stretch of the raw line it came from.
type Token = { text: string; from: number; to: number; code?: true; href?: string };

// Only a bullet at the head of the line, with whatever indentation a nested list gave it. A dash
// inside the text is part of the text, and an ordered list is left alone: its number is content.
const BULLET = /^[ \t]*[-*+][ \t]+/;

// A markdown link whose label holds no bracket of its own. The label is kept, the address moves to
// the href, and the whole `[label](url)` is one raw stretch.
const LINK = /^\[([^\]]*)\]\(([^()\s]*)\)/;

export function renderQuote(line: string, start: number, end: number): RenderedQuote {
  const tokens = tokenize(line);
  const pieces: QuotePiece[] = [];
  let offset = 0;
  let citedStart: number | null = null;
  let citedEnd = 0;

  for (const token of tokens) {
    // A token is cited when the citation covers it. A plain run is split so the underline stops at
    // the cited character; a code span or a link label is atomic, because half an Inline Code token
    // is not a thing the design has, and it is counted as cited when the citation touches it.
    const atomic = token.code || token.href !== undefined;
    const runs = atomic
      ? [{ text: token.text, cited: token.from < end && token.to > start }]
      : splitRun(token, start, end);

    for (const run of runs) {
      if (run.text === "") continue;
      if (run.cited) {
        citedStart ??= offset;
        citedEnd = offset + run.text.length;
      }
      pieces.push({ text: run.text, cited: run.cited, ...(token.code ? { code: true } : {}), ...(token.href !== undefined ? { href: token.href } : {}) });
      offset += run.text.length;
    }
  }

  return { pieces: merge(pieces), length: offset, start: citedStart ?? 0, end: citedStart === null ? 0 : citedEnd };
}

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const bullet = BULLET.exec(line)?.[0].length ?? 0;
  let plain = "";
  let plainFrom = bullet;
  let at = bullet;

  const flush = (to: number) => {
    if (plain !== "") tokens.push({ text: plain, from: plainFrom, to });
    plain = "";
  };

  while (at < line.length) {
    const rest = line.slice(at);

    const link = LINK.exec(rest);
    if (link) {
      flush(at);
      // The label is markdown too: `[`foo`](url)` is one link whose text is a code span.
      const inner = tokenize(link[1]);
      const text = inner.map((token) => token.text).join("");
      tokens.push({ text, from: at, to: at + link[0].length, href: link[2], ...(isCode(inner) ? { code: true } : {}) });
      at += link[0].length;
      plainFrom = at;
      continue;
    }

    if (line[at] === "`") {
      const close = line.indexOf("`", at + 1);
      // An unpaired backtick is content: it is shown as written rather than opening a span that
      // never closes, which is what `InlineCode` does with the prose around the quote.
      if (close !== -1) {
        flush(at);
        tokens.push({ text: line.slice(at + 1, close), from: at, to: close + 1, code: true });
        at = close + 1;
        plainFrom = at;
        continue;
      }
    }

    plain += line[at];
    at += 1;
  }
  flush(at);
  return tokens;
}

// A link whose label is entirely one code span keeps the Inline Code token inside the link.
function isCode(inner: Token[]): boolean {
  return inner.length === 1 && inner[0].code === true;
}

function splitRun(token: Token, start: number, end: number): { text: string; cited: boolean }[] {
  const cut = (at: number) => Math.min(Math.max(at - token.from, 0), token.text.length);
  const from = cut(start);
  const to = cut(end);
  return [
    { text: token.text.slice(0, from), cited: false },
    { text: token.text.slice(from, to), cited: true },
    { text: token.text.slice(to), cited: false },
  ];
}

// Neighbouring pieces that render the same way become one, so the markup carries no seam where the
// raw line merely happened to be cut.
function merge(pieces: QuotePiece[]): QuotePiece[] {
  return pieces.reduce<QuotePiece[]>((kept, piece) => {
    const last = kept.at(-1);
    const same = last && last.cited === piece.cited && last.code === piece.code && last.href === piece.href;
    if (same && last.href === undefined) last.text += piece.text;
    else kept.push(piece);
    return kept;
  }, []);
}
