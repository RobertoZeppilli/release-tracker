import { TriangleAlert, Wrench } from "lucide-react";
import { HelpPointer } from "@/components/help-pointer";
import { TechnologyMark } from "@/modules/catalog/ui";
import { releasePath } from "@/modules/releases";
import { SignificanceLabel } from "@/modules/releases/ui";
import { Glyph } from "@/modules/summaries/ui";
import { CITATION, EXCERPT, SPECIMEN } from "../domain/specimen";
import { CiteWell } from "./cite-well";
import { LandingSectionTitle } from "./landing-note";
import { SignInButton } from "./sign-in-button";
import { SourceView } from "./source-view";

// DESIGN.md, The Bench: four stages that never leave the page, in reading order, at every width.
const STAGES = ["source", "cite", "verdict", "help"] as const;

const GUTTER = "grid grid-cols-[5ch_1fr] max-[640px]:grid-cols-[4.5ch_1fr]";
const LABEL = "pr-[1.5ch] text-right text-text-faint [font-variant-ligatures:none] select-none max-[640px]:pr-[1ch]";

function Stage({ name, title, children }: { name: string; title: string; children: React.ReactNode }) {
  return (
    <div id={`stage-${name}`} className="mb-7 scroll-mt-5">
      <h3 className="mb-4 font-mono text-label text-text-faint">
        {name} · {title}
      </h3>
      {children}
    </div>
  );
}

export function Bench({ rail }: { rail: React.ReactNode }) {
  const release = releasePath(SPECIMEN.technology.slug, SPECIMEN.version);
  // The window the source view shows, named from the excerpt itself rather than retyped.
  const first = EXCERPT[0]?.number;
  const last = EXCERPT[EXCERPT.length - 1]?.number;
  const notes = `lines ${first} to ${last} of ${SPECIMEN.totalLines}`;

  return (
    <section aria-labelledby="bench-title">
      <LandingSectionTitle id="bench-title">one release, four stages</LandingSectionTitle>
      <p className="flex flex-wrap items-center gap-4 font-mono text-label text-text-muted">
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
      {rail}

      <Stage name="source" title="what the project published">
        <SourceView meta={notes} />
      </Stage>

      <Stage name="cite" title="the line the verdict rests on">
        <CiteWell />
        <p className="mt-4 max-w-measure font-sans text-body">
          Nothing is paraphrased. The verdict below quotes this line, points back at it, and would be
          wrong in a way you could see if the line said something else.
        </p>
      </Stage>

      <Stage name="verdict" title="what it means for you">
        <p className="font-mono text-verdict text-action">
          <TriangleAlert aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
          warning: <span className="inline-block text-text">action required</span>
        </p>
        <p className="mt-3 flex flex-wrap gap-4 font-mono text-diagnostic text-text-muted">
          <span>
            <span className="text-text">{SPECIMEN.breakingChanges}</span> breaking changes
          </span>
          <span>
            <span className="text-text">{SPECIMEN.notableChanges}</span> notable changes
          </span>
          <span>
            <span className="text-text">{SPECIMEN.totalLines}</span> lines read
          </span>
        </p>
        <article aria-labelledby="b1" className="mt-5 max-w-[900px]">
          <h4 id="b1" className="grid grid-cols-[auto_1fr] gap-x-3 font-sans text-title font-medium max-[640px]:grid-cols-1">
            <span className="font-mono text-[16px] leading-[1.7] whitespace-nowrap text-breaking">breaking[1]:</span>{" "}
            <span>propTypes stop being checked</span>
          </h4>
          <div className="mt-2 font-mono text-diagnostic">
            <p className={GUTTER}>
              <span aria-hidden className={LABEL}>
                &nbsp;
              </span>
              <span className="font-sans text-body">
                A component that declares <code>propTypes</code> keeps compiling and keeps running.
                Nothing warns, and nothing is checked any more.
              </span>
            </p>
            <p className={GUTTER}>
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
                  href="#stage-cite"
                  className="border-b border-dashed border-current font-mono text-label whitespace-nowrap text-help no-underline hover:border-solid"
                >
                  release-notes:{CITATION.line}
                </a>
              </span>
            </p>
          </div>
        </article>
      </Stage>

      <Stage name="help" title="where it goes next">
        <p className="max-w-measure font-sans text-body">
          The full verdict for this release lists all {SPECIMEN.breakingChanges} breaking changes the
          same way, each with its own cited line and its own help line, and the release notes sit
          under it as a numbered listing you can read in place.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <HelpPointer href={release}>
            read the full verdict for {SPECIMEN.technology.slug} {SPECIMEN.version}
          </HelpPointer>
          <SignInButton />
        </div>
      </Stage>
    </section>
  );
}

export { STAGES };
