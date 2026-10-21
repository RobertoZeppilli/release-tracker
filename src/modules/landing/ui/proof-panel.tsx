import { TriangleAlert } from "lucide-react";
import { TechnologyMark } from "@/modules/catalog/ui";
import { type Translator } from "@/modules/i18n";
import { SignificanceGlyph } from "@/modules/releases/ui";
import { CITATION, panelWindow, SPECIMEN } from "../domain/specimen";

const GUTTER = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4.5ch_1fr]";
const NUMBER = "pr-[1.5ch] text-right select-none max-[640px]:pr-[1.2ch]";

// DESIGN.md, Proof Panel: the right half of the first screen, and the one place in the product
// where the source and the verdict it produced are shown together, because a reader who has not
// scrolled yet has no other way to be told what this is. It is the Source View surface, not a
// second raised plane, and the lines are the real ones at their real numbers: the panel is the
// first thing a sceptical reader checks against GitHub.
// ⚠️ The lines inside the panel are release notes and are **never** translated (ADR 0008): they are
// the text the project published, which is the whole argument. What is translated around them is
// the frame: the window the panel shows, the verdict, and the word under the counts.
export function ProofPanel({ t }: { t: Translator }) {
  // The four real lines the panel stands on, chosen in the domain and tested there.
  const window = panelWindow();
  const first = window[0]?.number;
  const last = window[window.length - 1]?.number;

  return (
    <div data-arrival="" className="overflow-hidden rounded-md border border-rule bg-raised">
      <p className="flex items-center gap-3 border-b border-rule px-4 py-3 font-mono text-label text-text-muted">
        <span className="inline-flex items-center gap-2 text-text">
          <TechnologyMark slug={SPECIMEN.technology.slug} />
          {SPECIMEN.technology.slug} {SPECIMEN.version}
        </span>
        <SignificanceGlyph significance={SPECIMEN.significance} />
        <span className="ml-auto max-[640px]:hidden">
          {t("landing.panel.window", { first: first ?? "", last: last ?? "", total: SPECIMEN.totalLines })}
        </span>
      </p>
      <div className="p-4">
        <ol className="font-mono text-source text-text-muted">
          {window.map((line) => {
            const cited = line.number === CITATION.line;
            return (
              <li key={line.number} className={`${GUTTER} ${cited ? "bg-breaking-wash" : ""}`}>
                <span aria-hidden className={`${NUMBER} ${cited ? "text-text-muted" : "text-text-faint"}`}>
                  {line.number}
                </span>
                <span className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${cited ? "text-text" : ""}`}>
                  {line.text}
                </span>
              </li>
            );
          })}
        </ol>
        {/* The verdict those lines produced. The display line of this page is the claim beside it,
            so this one sits under Status scale, and its own clamp tracks the width of the column
            that holds it: the line has to hold on one row, and the column is a fraction of the page
            rather than the page (DESIGN.md, Proof Panel). The verdict is the Release page's own
            word, read from `release.verdict.action`, so the landing cannot drift from the app. */}
        <div className="mt-5 border-t border-rule pt-4">
          <p className="font-mono text-[length:clamp(1.5rem,2.4vw,1.9rem)] leading-[1.15] tracking-[-0.03em] text-action">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
            warning: <span className="inline-block text-text">{t("release.verdict.action")}</span>
          </p>
          <p className="mt-3 flex flex-wrap gap-4 font-mono text-label text-text-muted">
            <span>
              <span className="text-text">{SPECIMEN.breakingChanges}</span> breaking
            </span>
            <span>
              <span className="text-text">{SPECIMEN.notableChanges}</span> notable
            </span>
            <span>
              <span className="text-text">{SPECIMEN.totalLines}</span> {t("landing.panel.linesRead")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
