import { HelpPointer } from "@/components/help-pointer";
import { releasePath } from "@/modules/releases";
import { CITATION, SPECIMEN } from "../domain/specimen";
import { SignInButton } from "./sign-in-button";

// The claim carries the display scale and has nothing above it: a label over an `h1` is a kicker,
// which DESIGN.md forbids, and the Brand Mark already sits in the header. The stake under it is the
// argument in one sentence, and both of its figures are countable in the file the foot links to.
export function HeadingBlock() {
  return (
    <>
      <h1 className="max-w-[24ch] font-mono text-verdict text-balance">Understand before you upgrade.</h1>
      <p className="mt-5 max-w-measure font-sans text-summary-title font-medium text-pretty">
        React {SPECIMEN.version} shipped <strong className="font-medium">{SPECIMEN.breakingChanges} breaking changes</strong>{" "}
        across {SPECIMEN.totalLines} lines of release notes. One of them makes <code>propTypes</code> do
        nothing, silently, and it is on line {CITATION.line}.
      </p>
      <p className="mt-4 max-w-measure font-sans text-body text-text-muted">
        Verdict follows the releases of the technologies in your stack and gives each one a single
        verdict: whether it asks something of you, what breaks, and how to migrate. Every claim points
        at the line of the release notes it was read from, so you can check it in one click instead of
        trusting it.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <HelpPointer href={releasePath(SPECIMEN.technology.slug, SPECIMEN.version)}>
          see the verdict for {SPECIMEN.technology.slug} {SPECIMEN.version}
        </HelpPointer>
        <SignInButton />
      </div>
    </>
  );
}
