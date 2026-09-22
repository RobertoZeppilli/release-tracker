import { ChevronRight } from "lucide-react";
import { noteLines } from "../domain/release-page";

function origin(url: string | null): string | null {
  if (!url) return null;
  const { hostname, pathname } = new URL(url);
  return [hostname, ...pathname.split("/").filter(Boolean).slice(0, 2)].join("/");
}

// The notes as stored, folded and numbered like a source file: a different register from the Summary.
export function ReleaseNotesSource({ body, url }: { body: string; url: string | null }) {
  const lines = noteLines(body);
  const meta = [origin(url), `${lines.length} line${lines.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ");
  return (
    <details id="release-notes" className="group mt-7 rounded-md border border-rule bg-raised">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-[14px] [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 motion-reduce:transition-none"
        />
        release-notes
        <span className="ml-auto text-label text-text-muted max-[640px]:hidden">{meta}</span>
      </summary>
      <ol className="overflow-x-auto border-t border-rule py-3 font-mono text-source text-text-muted [counter-reset:line]">
        {lines.map((line, index) => (
          <li
            key={index}
            id={`L${index + 1}`}
            className="grid grid-cols-[6ch_1fr] [counter-increment:line] before:pr-[2ch] before:text-right before:text-text-faint before:content-[counter(line)] before:select-none max-[640px]:grid-cols-[4.5ch_1fr] max-[640px]:before:pr-[1.2ch]"
          >
            <span className={`pr-4 whitespace-pre-wrap [overflow-wrap:anywhere] ${line.startsWith("#") ? "text-text" : ""}`}>{line}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
