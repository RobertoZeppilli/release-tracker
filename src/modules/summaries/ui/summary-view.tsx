import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { locateCitation } from "../domain/citations";
import type { StoredSummary } from "../domain/summary-content";
import { BreakingChangeItem } from "./breaking-change-item";
import { CitePointer } from "./cite-pointer";
import { Glyph } from "./glyph";
import { InlineCode } from "./inline-code";

function plural(count: number, word: string): string {
  return `${word}${count === 1 ? "" : "s"}`;
}

// `notes` are the release notes as the source view below renders them: the line numbers of a citation
// are derived from that same text, so a quote the notes do not contain simply gets no pointer.
export function SummaryView({ summary, notes = [] }: { summary: StoredSummary; notes?: string[] }) {
  const { content, model, promptVersion } = summary;
  const breaking = content.breakingChanges.length;
  const provenance = ["summary", "from the release notes only", model, promptVersion && `prompt ${promptVersion}`];
  const body = notes.join("\n");
  const cite = (quote: string | undefined) => (quote ? locateCitation(body, quote) : null);
  return (
    <section aria-labelledby="verdict" className="mt-6">
      <p id="verdict" className="flex flex-wrap items-baseline gap-x-[0.4ch] font-mono text-verdict">
        {content.actionRequired ? (
          <span className="text-action">
            <Glyph Icon={TriangleAlert} />
            warning:
          </span>
        ) : (
          <span className="text-ok">
            <Glyph Icon={CircleCheck} />
            ok:
          </span>
        )}{" "}
        <span>{content.actionRequired ? "action required" : "safe to upgrade"}</span>
      </p>
      <p className="mt-3 flex flex-wrap gap-4 font-mono text-[15px] text-text-muted">
        {breaking > 0 ? (
          <a href="#breaking" className="border-b border-rule-strong no-underline">
            <strong className="font-normal text-text">{breaking}</strong> {plural(breaking, "breaking change")}
          </a>
        ) : (
          <span>
            <strong className="font-normal text-text">0</strong> breaking changes
          </span>
        )}
        <span>
          <strong className="font-normal text-text">{content.keyPoints.length}</strong> key points
        </span>
      </p>

      <h2 className="mt-5 max-w-measure font-sans text-summary-title font-medium text-balance">
        <InlineCode text={content.title} />
      </h2>
      <p className="mt-2 font-mono text-meta text-text-faint">{provenance.filter(Boolean).join(" · ")}</p>

      <ul aria-label="Key points" className="mt-5 max-w-measure border-t border-rule">
        {content.keyPoints.map((point, index) => {
          const citation = cite(point.quote);
          return (
            <li key={index} className="grid grid-cols-[8.5ch_1fr] gap-3 border-b border-rule py-2 max-[640px]:grid-cols-1 max-[640px]:gap-0">
              <span className="whitespace-nowrap font-mono text-[14px] leading-[1.6] text-text-muted">
                <Glyph Icon={Info} />
                note:
              </span>{" "}
              <span>
                <InlineCode text={point.text} />
                {citation && <CitePointer citation={citation} severity="note" className="ml-2" />}
              </span>
            </li>
          );
        })}
      </ul>

      {breaking > 0 && (
        <>
          <h2
            id="breaking"
            className="mt-7 mb-4 flex items-baseline gap-3 font-mono text-section-title font-semibold text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']"
          >
            breaking changes ({breaking})
          </h2>
          {content.breakingChanges.map((change, index) => (
            <BreakingChangeItem key={index} number={index + 1} change={change} lines={notes} citation={cite(change.quote)} />
          ))}
        </>
      )}
    </section>
  );
}
