// The bench specimen: React 19.0.0 as GitHub published it. Nothing here is written for the landing,
// and every figure is countable in a public file (DESIGN.md, "Don't invent a Release"): the notes
// are 271 lines, the `### React` section lists 13 breaking changes, and the sentence the page cites
// is on line 47 because that is where it is. `specimen.test.ts` holds the excerpt to that promise.

export type SourceLine = {
  number: number;
  text: string;
  // A markdown heading, which the source view inks in `text` like the release notes panel does.
  heading?: boolean;
};

// Lines 43 to 50 of the notes. The page shows a window, not the file: a landing that pasted 271
// lines would be arguing by weight instead of by citation.
export const EXCERPT: SourceLine[] = [
  { number: 43, text: "### React", heading: true },
  { number: 44, text: " " },
  {
    number: 45,
    text: "* New JSX Transform is now required: We introduced a new JSX transform in 2020 to improve bundle size and use JSX without importing React.",
  },
  {
    number: 46,
    text: "* Errors in render are not re-thrown: Errors that are not caught by an Error Boundary are now reported to window.reportError.",
  },
  {
    number: 47,
    text: "* Removed: `propTypes`: Using `propTypes` will now be silently ignored. If required, we recommend migrating to TypeScript or another type-checking solution.",
  },
  { number: 48, text: "* Removed: `defaultProps` for functions: ES6 default parameters can be used in place." },
  {
    number: 49,
    text: "* Removed: `contextTypes` and `getChildContext`: Legacy Context for class components has been removed.",
  },
  { number: 50, text: "* Removed: string refs: Any usage of string refs need to be migrated to ref callbacks." },
];

// What the `cite` stage quotes. `quote` is a stretch of the cited line and `cited` a stretch of the
// quote: both are substrings, not retellings, so the caret row can count characters over the quote
// and the quote can be checked against the line it claims to come from.
export const CITATION = {
  line: 47,
  quote: "Using `propTypes` will now be silently ignored.",
  cited: "will now be silently ignored",
} as const;

export const SPECIMEN = {
  technology: { name: "React", slug: "react" },
  version: "19.0.0",
  publishedAt: "2024-12-05",
  significance: "featured",
  source: "GitHub Releases",
  totalLines: 271,
  breakingChanges: 13,
  notableChanges: 8,
  notesUrl: "https://github.com/facebook/react/releases/tag/v19.0.0",
} as const;

export type Span = { start: number; end: number };

// Where the cited stretch falls inside the quote, in characters, which is what the caret row pads
// with. `null` when the stretch is not in the quote: the caller shows the quote without carets
// rather than drawing them under the wrong words.
export function citedSpan(quote: string, cited: string): Span | null {
  const start = quote.indexOf(cited);
  return start < 0 ? null : { start, end: start + cited.length };
}

// The window the Proof Panel shows, which is narrower than the bench's: the entries only, without
// the markdown heading and the blank line, and of those the cited one with a line above and two
// below. Four real lines is what stands beside the claim over the fold. They are never shortened
// and never reworded, because the panel is the first thing a sceptical reader checks against the
// file the foot links to (DESIGN.md, Proof Panel).
export function panelWindow(): SourceLine[] {
  const entries = EXCERPT.filter((line) => !line.heading && line.text.trim() !== "");
  const cited = entries.findIndex((line) => line.number === CITATION.line);
  return entries.slice(Math.max(cited - 1, 0), cited + 3);
}

// The one line of the excerpt the citation rests on.
export function citedLine(): SourceLine | undefined {
  return EXCERPT.find((line) => line.number === CITATION.line);
}
