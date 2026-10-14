import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { locateCitation } from "../domain/citations";
import type { StoredSummary } from "../domain/summary-content";
import { BreakingChangeItem } from "./breaking-change-item";
import { CitePointer } from "./cite-pointer";
import { SectionTitle } from "./section-title";
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
  // `migration` is required by the schema, so every breaking change has a fix; `quote` is not, so
  // the claim that they are all cited is only made where it holds.
  const allCited = content.breakingChanges.every((change) => cite(change.quote) !== null);
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
      {/* DESIGN.md, Counts Panel: the two numbers the Summary claims, in a mini-panel 16px under
          the verdict and as wide as its content, never running to the rule. Beside the verdict they
          were a second thing on the display line and capped its scale; under it they cost the line
          nothing. They carry no ink, the breaking one included: the verdict above is already amber
          or green, and a second colour claiming the same fact would make the reader decide which of
          the two is the page's judgement. In the seventh state the panel follows the paragraph that
          withdraws the verdict, which is the order these three are written in here. */}
      <p className="mt-4 flex w-max max-w-full flex-wrap items-baseline gap-x-4 gap-y-1 rounded-md border border-rule bg-raised px-3 py-2 font-mono text-diagnostic text-text-muted">
        {breaking > 0 ? (
          <a href="#breaking" className="border-b border-rule-strong no-underline hover:border-current">
            <strong className="font-normal text-text">{breaking}</strong> {plural(breaking, "breaking change")}
          </a>
        ) : (
          <span>
            <strong className="font-normal text-text">0</strong> breaking changes
          </span>
        )}
        <a href="#key-points" className="border-b border-rule-strong no-underline hover:border-current">
          <strong className="font-normal text-text">{content.keyPoints.length}</strong> key points
        </a>
      </p>

      <h2 className="mt-5 max-w-measure font-sans text-summary-title font-medium text-balance">
        <InlineCode text={content.title} />
      </h2>
      <p className="mt-2 font-mono text-meta text-text-faint">{provenanceLine(summary)}</p>

      {/* The order is the one cut the mock makes, and the reason it exists: with `action required`
          the breaking changes are the work and the key points are the surround, so the work comes
          first. On the old page the first breaking change stood at 811px, under the fold of a
          laptop, behind four key points nobody had asked to read yet. Where there are none the
          section is not there at all and the key points follow the title directly, which is the same
          order read from the other end: whatever this Release asks of you, first. */}
      {breaking > 0 && (
        <>
          <SectionTitle id="breaking" title="breaking changes" aside={allCited ? "all cited, each with a fix" : "each with a fix"} />
          {content.breakingChanges.map((change, index) => (
            <BreakingChangeItem key={index} number={index + 1} change={change} lines={notes} citation={cite(change.quote)} />
          ))}
        </>
      )}

      <SectionTitle id="key-points" title="key points" />
      <ul aria-labelledby="key-points" className="border-t border-rule">
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
              className="grid scroll-mt-6 grid-cols-[11.5ch_1fr] gap-3 border-b border-rule py-2 phone:grid-cols-1 phone:gap-0"
            >
              <span className="whitespace-nowrap font-mono text-[14px] leading-[1.6] text-text-muted">
                <Glyph Icon={Info} />
                note[{number}]:
              </span>{" "}
              <span className="max-w-measure">
                <InlineCode text={point.text} />
                {citation && <CitePointer citation={citation} severity="note" origin={{ id, label: `note[${number}]` }} className="ml-2" />}
              </span>
            </li>
          );
        })}
      </ul>

    </section>
  );
}
