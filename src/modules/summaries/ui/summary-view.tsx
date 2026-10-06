import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { locateCitation } from "../domain/citations";
import type { StoredSummary } from "../domain/summary-content";
import { BreakingChangeItem } from "./breaking-change-item";
import { CitePointer } from "./cite-pointer";
import { Glyph } from "./glyph";
import { InlineCode } from "./inline-code";
import { provenanceLine } from "./summary-copy";

function plural(count: number, word: string): string {
  return `${word}${count === 1 ? "" : "s"}`;
}

const VERDICTS = {
  action: { Icon: TriangleAlert, className: "text-action", label: "warning:", claim: "action required" },
  safe: { Icon: CircleCheck, className: "text-ok", label: "ok:", claim: "safe to upgrade" },
  unjudged: { Icon: Info, className: "text-text-muted", label: "note:", claim: "not enough notes to judge" },
} as const;

// `notes` are the release notes as the source view below renders them: the line numbers of a citation
// are derived from that same text, so a quote the notes do not contain simply gets no pointer.
export function SummaryView({
  summary,
  notes = [],
  unjudged = false,
}: {
  summary: StoredSummary;
  notes?: string[];
  unjudged?: boolean;
}) {
  const { content } = summary;
  const breaking = content.breakingChanges.length;
  const body = notes.join("\n");
  const cite = (quote: string | undefined) => (quote ? locateCitation(body, quote) : null);
  const verdict = VERDICTS[unjudged ? "unjudged" : content.actionRequired ? "action" : "safe"];
  return (
    <section aria-labelledby="verdict" className="mt-6">
      <p id="verdict" className="flex flex-wrap items-baseline gap-x-[0.4ch] font-mono text-verdict">
        <span className={verdict.className}>
          <Glyph Icon={verdict.Icon} />
          {verdict.label}
        </span>{" "}
        <span>{verdict.claim}</span>
      </p>
      {/* DESIGN.md, Summary States: the muted state says where the notes that could be judged are,
          instead of leaving the reader with a verdict we withdrew and no next move. */}
      {unjudged && (
        <p className="mt-3 max-w-measure text-text-muted">
          These release notes point somewhere else instead of describing what changed, so neither
          verdict would be honest: we found no breaking changes, which is not the same as there being
          none. The notes are below, with the link they point to.
        </p>
      )}
      {/* The counts row is `diagnostic`, the same as the Dashboard's: 15px was never in the scale. */}
      <p className="mt-3 flex flex-wrap gap-4 font-mono text-diagnostic text-text-muted">
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
      <p className="mt-2 font-mono text-meta text-text-faint">{provenanceLine(summary)}</p>

      <ul aria-label="Key points" className="mt-5 max-w-measure border-t border-rule">
        {content.keyPoints.map((point, index) => {
          const citation = cite(point.quote);
          const number = index + 1;
          const id = `n${number}`;
          // Numbered, and focusable, for the same reason `breaking[1]` is: a citation that leads
          // into the notes has to be able to name the diagnostic it came from on the way back.
          return (
            <li
              key={index}
              id={id}
              tabIndex={-1}
              className="grid scroll-mt-6 grid-cols-[11.5ch_1fr] gap-3 border-b border-rule py-2 max-[640px]:grid-cols-1 max-[640px]:gap-0"
            >
              <span className="whitespace-nowrap font-mono text-[14px] leading-[1.6] text-text-muted">
                <Glyph Icon={Info} />
                note[{number}]:
              </span>{" "}
              <span>
                <InlineCode text={point.text} />
                {citation && <CitePointer citation={citation} severity="note" origin={{ id, label: `note[${number}]` }} className="ml-2" />}
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
