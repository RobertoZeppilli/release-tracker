"use client";

import { ChevronRight } from "lucide-react";
import { Fragment, useEffect, useRef } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import { citationSpans } from "@/modules/summaries";
import { type CiteOrigin, useCitation } from "@/modules/summaries/ui";

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

// The gutter the line numbers are counted into, shared with the back pointer so the two stay aligned.
const GUTTER = "grid grid-cols-[6ch_1fr] phone:grid-cols-[4.5ch_1fr]";

// The return leg of a cite pointer (issue #85). It sits on a row of its own above the active range,
// washed and inked like it, and names the diagnostic that cited rather than a generic way up. A
// plain `#id` link: the browser scrolls, focuses the heading because it carries `tabindex="-1"`, and
// leaves Back pointing at the cited line. Deliberately not animated, so the underline on the way in
// stays the system's only motion moment.
function BackToDiagnostic({ to, wash }: { to: CiteOrigin; wash: string }) {
  const t = useTranslator();

  return (
    <li className={`${GUTTER} ${wash}`}>
      <span
        aria-hidden
        className="pr-[2ch] text-right text-text-faint [font-variant-ligatures:none] select-none phone:pr-[1.2ch]"
      >
        {"<--"}
      </span>
      <span>
        <a
          href={`#${to.id}`}
          className="border-b border-dashed border-current text-[color:var(--cite)] no-underline hover:border-solid"
        >
          {t("release.source.back", { label: to.label })}
        </a>
      </span>
    </li>
  );
}

// The notes as stored, folded and numbered like a source file: a different register from the Summary.
export function ReleaseNotesSource({ lines, url }: { lines: string[]; url: string | null }) {
  const t = useTranslator();
  const panel = useRef<HTMLDetailsElement>(null);
  const active = useCitation()?.active ?? null;
  const spans = active ? citationSpans(lines, active.citation) : [];
  const cited = new Map(spans.map((span) => [span.line, span]));
  const back = spans[0]?.line ?? null;
  const wash = active?.severity === "breaking" ? "bg-breaking-wash [--cite:var(--breaking)]" : "bg-help-wash [--cite:var(--help)]";

  useEffect(() => {
    if (active) reveal(panel.current, active.citation.fromLine);
  }, [active]);

  useEffect(() => {
    const match = /^#L(\d+)$/.exec(window.location.hash);
    if (match) reveal(panel.current, Number(match[1]));
  }, []);

  const meta = [origin(url), t("release.source.lines", { count: lines.length })].filter(Boolean).join(" · ");
  return (
    <details ref={panel} id="release-notes" className="group mt-7 rounded-md border border-rule bg-raised">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-[14px] [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
        />
        release-notes
        <span className="ml-auto text-label text-text-muted phone:hidden">{meta}</span>
      </summary>
      <ol className="overflow-x-auto border-t border-rule py-3 font-mono text-source text-text-muted [counter-reset:line]">
        {lines.map((line, index) => {
          const span = cited.get(index + 1);
          return (
            <Fragment key={index}>
              {active && index + 1 === back && <BackToDiagnostic to={active.origin} wash={wash} />}
              <li
                id={`L${index + 1}`}
                tabIndex={-1}
                className={`${GUTTER} scroll-mt-[30vh] [counter-increment:line] before:pr-[2ch] before:text-right before:text-text-faint before:content-[counter(line)] before:select-none phone:before:pr-[1.2ch] ${span ? wash : ""}`}
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
            </Fragment>
          );
        })}
      </ol>
    </details>
  );
}
