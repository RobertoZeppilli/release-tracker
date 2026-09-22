import { CircleCheck, Info, type LucideIcon, OctagonAlert, TriangleAlert, Wrench } from "lucide-react";
import type { BreakingChange, StoredSummary } from "../domain/summary-content";
import { InlineCode } from "./inline-code";

// DESIGN.md: severity is always a glyph plus a label, never colour alone.
function Glyph({ Icon }: { Icon: LucideIcon }) {
  return <Icon aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />;
}

function plural(count: number, word: string): string {
  return `${word}${count === 1 ? "" : "s"}`;
}

export function SummaryView({ summary }: { summary: StoredSummary }) {
  const { content, model, promptVersion } = summary;
  const breaking = content.breakingChanges.length;
  const provenance = ["summary", "from the release notes only", model, promptVersion && `prompt ${promptVersion}`];
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
        {content.keyPoints.map((point, index) => (
          <li key={index} className="grid grid-cols-[8.5ch_1fr] gap-3 border-b border-rule py-2">
            <span className="whitespace-nowrap font-mono text-[14px] leading-[1.6] text-text-muted">
              <Glyph Icon={Info} />
              note:
            </span>{" "}
            <span>
              <InlineCode text={point} />
            </span>
          </li>
        ))}
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
            <BreakingChangeItem key={index} number={index + 1} change={change} />
          ))}
        </>
      )}
    </section>
  );
}

function BreakingChangeItem({ number, change }: { number: number; change: BreakingChange }) {
  const id = `b${number}`;
  return (
    <article aria-labelledby={id} className="mb-6 max-w-[900px]">
      <h3 id={id} className="grid grid-cols-[auto_1fr] gap-x-3 font-sans text-title font-medium">
        <span className="whitespace-nowrap font-mono text-[16px] leading-[1.7] text-breaking">
          <Glyph Icon={OctagonAlert} />
          breaking[{number}]:
        </span>{" "}
        <span>
          <InlineCode text={change.change} />
        </span>
      </h3>
      <p className="mt-2 grid grid-cols-[5ch_1fr] font-mono text-diagnostic">
        <span aria-hidden className="select-none pr-[1.5ch] text-right text-text-faint">
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
    </article>
  );
}
