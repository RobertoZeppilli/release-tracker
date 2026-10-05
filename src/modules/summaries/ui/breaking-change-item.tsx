import { OctagonAlert, Wrench } from "lucide-react";
import { type CaretWidth, caretWidth } from "../domain/caret-row";
import { type Citation, citationSpans } from "../domain/citations";
import { type QuotePiece, renderQuote } from "../domain/quote-markdown";
import type { BreakingChange } from "../domain/summary-content";
import { CitePointer } from "./cite-pointer";
import { Glyph } from "./glyph";
import { InlineCode } from "./inline-code";

const gutter = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4ch_1fr]";
// Ligatures off, so the `-->` pointer stays the three characters it is written as.
const gutterLabel = "pr-[1.5ch] text-right text-text-faint [font-variant-ligatures:none] select-none max-[640px]:pr-[1ch]";

// DESIGN.md: the quote row and its caret row form one `sunken` well. The caret row is shown only
// while the quote is certain to stay on one line (see `caretWidth`); below that width the cited
// stretch carries a coral underline inside the quote row instead, which stays right however it wraps.
const CARET: Record<CaretWidth | "never", { caret: string; cited: string }> = {
  641: { caret: "max-[640px]:hidden", cited: "max-[640px]:cited-quote" },
  768: { caret: "max-[767px]:hidden", cited: "max-[767px]:cited-quote" },
  900: { caret: "max-[899px]:hidden", cited: "max-[899px]:cited-quote" },
  1024: { caret: "max-[1023px]:hidden", cited: "max-[1023px]:cited-quote" },
  never: { caret: "hidden", cited: "cited-quote" },
};

// A quoted piece keeps the monospace grid: `quoted-code` is the Inline Code token without the size
// and padding that would move the characters off it, and a link is marked with a bottom border,
// which takes no width either. Both are what the caret row below counts on.
function Piece({ piece, cited }: { piece: QuotePiece; cited: string }) {
  const marked = piece.cited ? cited : "";
  if (piece.href !== undefined) {
    return (
      <a href={piece.href} className={`border-b border-dashed border-current text-help no-underline hover:border-solid ${marked}`}>
        {piece.code ? <code className="quoted-code">{piece.text}</code> : piece.text}
      </a>
    );
  }
  if (piece.code) return <code className={`quoted-code ${marked}`}>{piece.text}</code>;
  return <span className={marked}>{piece.text}</span>;
}

function QuoteWell({ line, text, start, end }: { line: number; text: string; start: number; end: number }) {
  // The notes are markdown and the well renders them cleaned (issue #84), so everything measured
  // here is measured on what is drawn: the quote's width, and where the cited stretch falls.
  const quote = renderQuote(text, start, end);
  const { caret, cited } = CARET[caretWidth(quote.length) ?? "never"];
  const drawn = quote.pieces.map((piece) => piece.text).join("");
  return (
    <div className="my-[2px] rounded-inline bg-sunken py-[6px]">
      <div className={gutter}>
        <span aria-hidden className={gutterLabel}>
          {line}
        </span>
        {/* A quote can carry an identifier longer than the column: it breaks rather than widening
            the page. Where the caret row is shown the quote is short enough not to wrap. */}
        <span className="pr-3 whitespace-pre-wrap [overflow-wrap:anywhere] text-text-muted">
          {quote.pieces.map((piece, index) => (
            <Piece key={index} piece={piece} cited={cited} />
          ))}
        </span>
      </div>
      <div aria-hidden className={`${gutter} leading-none ${caret}`}>
        <span className={gutterLabel}>|</span>
        <span className="pr-3 whitespace-pre-wrap">
          <span className="invisible">{drawn.slice(0, quote.start)}</span>
          <span className="text-breaking">{"^".repeat(quote.end - quote.start)}</span>
        </span>
      </div>
    </div>
  );
}

export function BreakingChangeItem({
  number,
  change,
  lines,
  citation,
}: {
  number: number;
  change: BreakingChange;
  lines: string[];
  citation: Citation | null;
}) {
  const id = `b${number}`;
  const [span] = citation ? citationSpans(lines, citation) : [];
  return (
    <article aria-labelledby={id} className="mb-6 max-w-[900px]">
      <h3 id={id} className="grid grid-cols-[auto_1fr] gap-x-3 font-sans text-title font-medium max-[640px]:grid-cols-1">
        <span className="whitespace-nowrap font-mono text-[16px] leading-[1.7] text-breaking">
          <Glyph Icon={OctagonAlert} />
          breaking[{number}]:
        </span>{" "}
        <span>
          <InlineCode text={change.change} />
        </span>
      </h3>
      <div className="mt-2 font-mono text-diagnostic">
        {citation && (
          <>
            <div className={gutter}>
              <span aria-hidden className={gutterLabel}>
                {"-->"}
              </span>
              <span>
                <CitePointer citation={citation} severity="breaking" />
              </span>
            </div>
            {span && <QuoteWell line={span.line} text={lines[span.line - 1] ?? ""} start={span.start} end={span.end} />}
          </>
        )}
        <p className={gutter}>
          <span aria-hidden className={gutterLabel}>
            =
          </span>
          <span className="font-sans text-body">
            <span className="font-mono text-[14px] text-help">
              <Glyph Icon={Wrench} />
              help:
            </span>{" "}
            <InlineCode text={change.migration} />
          </span>
        </p>
      </div>
    </article>
  );
}
