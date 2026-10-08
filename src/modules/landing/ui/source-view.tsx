import { CITATION, EXCERPT, SPECIMEN } from "../domain/specimen";

// The `6ch` gutter of the release notes panel, so the window on the landing counts its lines into
// the same column the app does.
const GUTTER = "grid grid-cols-[6ch_1fr] max-[640px]:grid-cols-[4.5ch_1fr]";
const NUMBER = "pr-[2ch] text-right select-none max-[640px]:pr-[1.2ch]";
// The cited line is washed `breaking`, and `text-faint` over that wash falls under 4.5:1 in the dark
// theme. The Release page never had to answer this because its numbers are a CSS counter; here they
// are real text, so the cited row lifts its number with the rest of the line.

// Stage 1 of the bench: the notes as the project published them, at their real line numbers, in the
// register the Release page uses for the same text. The cited line carries the `breaking` wash it
// carries there, so a reader who follows the pointer later recognises what they already saw.
export function SourceView({ meta }: { meta: string }) {
  return (
    <div className="max-w-measure rounded-md border border-rule bg-raised">
      <p className="flex items-center gap-3 px-4 py-3 font-mono text-[14px]">
        release-notes: {SPECIMEN.technology.slug} {SPECIMEN.version}
        <span className="ml-auto text-label text-text-muted max-[640px]:hidden">{meta}</span>
      </p>
      <ol className="overflow-x-auto border-t border-rule py-3 font-mono text-source text-text-muted">
        {EXCERPT.map((line) => {
          const cited = line.number === CITATION.line;
          return (
            <li key={line.number} className={`${GUTTER} ${cited ? "bg-breaking-wash" : ""}`}>
              <span aria-hidden className={`${NUMBER} ${cited ? "text-text-muted" : "text-text-faint"}`}>
                {line.number}
              </span>
              <span
                className={`pr-4 whitespace-pre-wrap [overflow-wrap:anywhere] ${line.heading || cited ? "text-text" : ""}`}
              >
                {line.text}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-rule px-4 pt-2 pb-3 font-mono text-meta text-text-faint">
        kept exactly as published · {SPECIMEN.breakingChanges} breaking changes are listed in this section
      </p>
    </div>
  );
}
