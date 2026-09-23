import { OctagonAlert, Wrench } from "lucide-react";
import { type Citation, citationSpans } from "../domain/citations";
import type { BreakingChange } from "../domain/summary-content";
import { CitePointer } from "./cite-pointer";
import { Glyph } from "./glyph";
import { InlineCode } from "./inline-code";

const gutter = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4ch_1fr]";
// Ligatures off, so the `-->` pointer stays the three characters it is written as.
const gutterLabel = "pr-[1.5ch] text-right text-text-faint [font-variant-ligatures:none] select-none max-[640px]:pr-[1ch]";

// DESIGN.md: the quote row and its caret row form one `sunken` well. Below 640px the caret row is
// hidden and the cited stretch carries a coral underline inside the quote row instead.
function QuoteWell({ line, text, start, end }: { line: number; text: string; start: number; end: number }) {
  return (
    <>
      <div className={`${gutter} mt-[2px] rounded-t-inline bg-sunken pt-[6px] max-[640px]:mb-[2px] max-[640px]:rounded-inline max-[640px]:pb-[6px]`}>
        <span aria-hidden className={gutterLabel}>
          {line}
        </span>
        <span className="pr-3 whitespace-pre-wrap text-text-muted">
          {text.slice(0, start)}
          <span className="max-[640px]:underline max-[640px]:decoration-breaking max-[640px]:decoration-2 max-[640px]:underline-offset-4">
            {text.slice(start, end)}
          </span>
          {text.slice(end)}
        </span>
      </div>
      <div aria-hidden className={`${gutter} mb-[2px] rounded-b-inline bg-sunken pb-1 leading-none max-[640px]:hidden`}>
        <span className={gutterLabel}>|</span>
        <span className="pr-3 whitespace-pre-wrap">
          <span className="invisible">{text.slice(0, start)}</span>
          <span className="text-breaking">{"^".repeat(end - start)}</span>
        </span>
      </div>
    </>
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
