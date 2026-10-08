import { type CaretWidth, caretWidth } from "@/modules/summaries";
import { CITATION, citedSpan } from "../domain/specimen";
import { CaretDraw } from "./caret-draw";

// The caret row only reads right while the quote stays on one line, so it is hidden below the width
// where it would wrap and the cited stretch carries the coral underline instead (DESIGN.md). The
// quote here is short enough to hold at every width a caret row exists at, and `caretWidth` is the
// same answer the Release page asks for, so a change to the font or the column moves both.
const CARET: Record<CaretWidth | "never", { caret: string; cited: string }> = {
  641: { caret: "max-[640px]:hidden", cited: "max-[640px]:cited-quote" },
  768: { caret: "max-[767px]:hidden", cited: "max-[767px]:cited-quote" },
  900: { caret: "max-[899px]:hidden", cited: "max-[899px]:cited-quote" },
  1024: { caret: "max-[1023px]:hidden", cited: "max-[1023px]:cited-quote" },
  never: { caret: "hidden", cited: "cited-quote" },
};

// The id `CaretDraw` arms, and the one the mock used for the same well.
const WELL_ID = "cited-quote";

const GUTTER = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4.5ch_1fr]";
const LABEL = "pr-[1.5ch] text-right text-text-faint [font-variant-ligatures:none] select-none max-[640px]:pr-[1ch]";

export function CiteWell() {
  const span = citedSpan(CITATION.quote, CITATION.cited);
  const { caret, cited } = CARET[span ? (caretWidth(CITATION.quote.length) ?? "never") : "never"];

  return (
    <>
      <div
        id={WELL_ID}
        className="my-[2px] max-w-measure rounded-inline bg-sunken py-[6px] font-mono text-diagnostic"
      >
        <div className={GUTTER}>
          <span aria-hidden className={LABEL}>
            {CITATION.line}
          </span>
          <span className="pr-3 whitespace-pre-wrap [overflow-wrap:anywhere] text-text-muted">
            {span ? (
              <>
                {CITATION.quote.slice(0, span.start)}
                <span className={`text-text ${cited}`}>{CITATION.cited}</span>
                {CITATION.quote.slice(span.end)}
              </>
            ) : (
              CITATION.quote
            )}
          </span>
        </div>
        {span && (
          <div aria-hidden className={`${GUTTER} leading-none ${caret}`}>
            <span className={LABEL}>|</span>
            <span className="pr-3 whitespace-pre-wrap">
              <span className="invisible">{CITATION.quote.slice(0, span.start)}</span>
              <span className="caret-run text-breaking">{"^".repeat(span.end - span.start)}</span>
            </span>
          </div>
        )}
      </div>
      <CaretDraw target={WELL_ID} />
    </>
  );
}
