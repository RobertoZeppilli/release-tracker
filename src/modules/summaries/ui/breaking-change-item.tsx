import { OctagonAlert, Wrench } from "lucide-react";
import { type CaretWidth, caretWidth } from "../domain/caret-row";
import { type Citation, citationSpans } from "../domain/citations";
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

function QuoteWell({ line, text, start, end }: { line: number; text: string; start: number; end: number }) {
  const { caret, cited } = CARET[caretWidth(text.length) ?? "never"];
  return (
    <div className="my-[2px] rounded-inline bg-sunken py-[6px]">
      <div className={gutter}>
        <span aria-hidden className={gutterLabel}>
          {line}
        </span>
        {/* A quote can carry a URL or an identifier longer than the column: it breaks rather than
            widening the page. Where the caret row is shown the quote is short enough not to wrap. */}
        <span className="pr-3 whitespace-pre-wrap [overflow-wrap:anywhere] text-text-muted">
          {text.slice(0, start)}
          <span className={cited}>{text.slice(start, end)}</span>
          {text.slice(end)}
        </span>
      </div>
      <div aria-hidden className={`${gutter} leading-none ${caret}`}>
        <span className={gutterLabel}>|</span>
        <span className="pr-3 whitespace-pre-wrap">
          <span className="invisible">{text.slice(0, start)}</span>
          <span className="text-breaking">{"^".repeat(end - start)}</span>
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
