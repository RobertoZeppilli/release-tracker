import { Wrench } from "lucide-react";
import { TechnologyMark } from "@/modules/catalog/ui";
import { releasePath } from "@/modules/releases";
import { SignificanceLabel } from "@/modules/releases/ui";
import { Glyph } from "@/modules/summaries/ui";
import { CITATION, panelWindow, SPECIMEN } from "../domain/specimen";
import { Band } from "./band";
import { CiteWell } from "./cite-well";

// DESIGN.md, The Bench: four stages, in reading order, at every width. They sit two by two, which
// is what retired the rail: on one screen the anchors pointed at what the reader could already see.

const GUTTER = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4.5ch_1fr]";
const LABEL = "pr-[1.5ch] text-right text-text-faint [font-variant-ligatures:none] select-none max-[640px]:pr-[1ch]";

// A stage says its name louder than a section title does: the four words are the skeleton of the
// argument, and in muted 13px they read as captions to the prose instead of as its joints. The
// highlighter is the reader's own gesture on paper, and it is neutral by construction (DESIGN.md,
// Stage Title): a hue there would be a verdict on a word that judges nothing.
function Stage({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div id={`stage-${name}`} className="scroll-mt-8">
      <h3 className="mb-4">
        <span className="marker font-mono text-diagnostic font-semibold tracking-[0.02em]">{name}</span>
      </h3>
      {children}
    </div>
  );
}

export function Bench() {
  const release = releasePath(SPECIMEN.technology.slug, SPECIMEN.version);
  // The window the first screen shows, named from the panel's own lines rather than retyped.
  const shown = panelWindow();
  const notes = `lines ${shown[0]?.number} to ${shown[shown.length - 1]?.number}`;

  return (
    <Band
      id="bench-title"
      number="01"
      title="One release, four stages"
      sub={
        <>
          The same release the first screen quotes, read the way the app reads it: what the project
          published, the line the verdict rests on, the verdict itself, and where it goes next.
        </>
      }
    >
      <p className="mb-6 flex flex-wrap items-center gap-4 font-mono text-label text-text-muted">
        <span className="inline-flex items-center gap-2 text-text">
          <TechnologyMark slug={SPECIMEN.technology.slug} />
          {SPECIMEN.technology.name} {SPECIMEN.version}
        </span>
        <time dateTime={SPECIMEN.publishedAt}>{SPECIMEN.publishedAt}</time>
        <SignificanceLabel significance={SPECIMEN.significance} />
        <span>
          notes from {SPECIMEN.source}, {SPECIMEN.totalLines} lines
        </span>
      </p>

      <div className="grid grid-cols-2 gap-7 max-[1040px]:grid-cols-1">
        <Stage name="source">
          <p className="max-w-measure font-sans text-body text-text-muted">
            {SPECIMEN.totalLines} lines, kept exactly as published and numbered so a claim can name
            one of them. The {SPECIMEN.breakingChanges} breaking changes are listed in a single
            section, and the first screen shows {notes}.
          </p>
        </Stage>

        <Stage name="cite">
          <CiteWell />
          <p className="mt-4 max-w-measure font-sans text-body text-text-muted">
            Nothing is paraphrased. The verdict quotes this line, points back at it, and would be
            wrong in a way you could see if the line said something else.
          </p>
        </Stage>

        <Stage name="verdict">
          <article aria-labelledby="b1" className="max-w-[900px]">
            <h4 id="b1" className="grid grid-cols-[auto_1fr] gap-x-3 font-sans text-title font-medium max-[640px]:grid-cols-1">
              <span className="font-mono text-[16px] leading-[1.7] whitespace-nowrap text-breaking">breaking[1]:</span>{" "}
              <span>propTypes stop being checked</span>
            </h4>
            <p className="mt-2 max-w-[68ch] font-sans text-body text-text-muted">
              A component that declares <code>propTypes</code> keeps compiling and keeps running.
              Nothing warns, and nothing is checked any more.
            </p>
          </article>
        </Stage>

        <Stage name="help">
          <p className={`${GUTTER} font-mono text-diagnostic`}>
            <span aria-hidden className={LABEL}>
              =
            </span>
            <span className="font-sans text-body">
              <span className="font-mono text-[14px] text-help">
                <Glyph Icon={Wrench} />
                help:
              </span>{" "}
              migrate to TypeScript props, or to another type-checking solution.{" "}
              <a
                href={release}
                className="border-b border-dashed border-current font-mono text-label whitespace-nowrap text-help no-underline hover:border-solid"
              >
                release-notes:{CITATION.line}
              </a>
            </span>
          </p>
          <p className="mt-3 max-w-measure font-sans text-body text-text-muted">
            All {SPECIMEN.breakingChanges} breaking changes are listed the same way on the release
            page, each with its own cited line and its own help line.
          </p>
        </Stage>
      </div>
    </Band>
  );
}
