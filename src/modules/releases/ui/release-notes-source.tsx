"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { citationSpans } from "@/modules/summaries";
import { useCitation } from "@/modules/summaries/ui";

function origin(url: string | null): string | null {
  if (!url) return null;
  const { hostname, pathname } = new URL(url);
  return [hostname, ...pathname.split("/").filter(Boolean).slice(0, 2)].join("/");
}

// A cite pointer, or an `#L<n>` address opened directly, has to unfold the panel first: jumping to a
// line inside a closed <details> would leave the reader where they were.
function reveal(panel: HTMLDetailsElement | null, line: number) {
  if (panel) panel.open = true;
  const target = document.getElementById(`L${line}`);
  if (!target) return;
  target.scrollIntoView({ block: "center" });
  target.focus({ preventScroll: true });
}

// The notes as stored, folded and numbered like a source file: a different register from the Summary.
export function ReleaseNotesSource({ lines, url }: { lines: string[]; url: string | null }) {
  const panel = useRef<HTMLDetailsElement>(null);
  const active = useCitation()?.active ?? null;
  const spans = active ? citationSpans(lines, active.citation) : [];
  const cited = new Map(spans.map((span) => [span.line, span]));
  const wash = active?.severity === "breaking" ? "bg-breaking-wash [--cite:var(--breaking)]" : "bg-help-wash [--cite:var(--help)]";

  useEffect(() => {
    if (active) reveal(panel.current, active.citation.fromLine);
  }, [active]);

  useEffect(() => {
    const match = /^#L(\d+)$/.exec(window.location.hash);
    if (match) reveal(panel.current, Number(match[1]));
  }, []);

  const meta = [origin(url), `${lines.length} line${lines.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
  return (
    <details ref={panel} id="release-notes" className="group mt-7 rounded-md border border-rule bg-raised">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-[14px] [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
        />
        release-notes
        <span className="ml-auto text-label text-text-muted max-[640px]:hidden">{meta}</span>
      </summary>
      <ol className="overflow-x-auto border-t border-rule py-3 font-mono text-source text-text-muted [counter-reset:line]">
        {lines.map((line, index) => {
          const span = cited.get(index + 1);
          return (
            <li
              key={index}
              id={`L${index + 1}`}
              tabIndex={-1}
              className={`grid grid-cols-[6ch_1fr] scroll-mt-[30vh] [counter-increment:line] before:pr-[2ch] before:text-right before:text-text-faint before:content-[counter(line)] before:select-none max-[640px]:grid-cols-[4.5ch_1fr] max-[640px]:before:pr-[1.2ch] ${span ? wash : ""}`}
            >
              <span className={`pr-4 whitespace-pre-wrap [overflow-wrap:anywhere] ${line.startsWith("#") ? "text-text" : ""}`}>
                {span ? (
                  <>
                    {line.slice(0, span.start)}
                    <span key={active?.nonce} className="cited-span">
                      {line.slice(span.start, span.end)}
                    </span>
                    {line.slice(span.end)}
                  </>
                ) : (
                  line
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
