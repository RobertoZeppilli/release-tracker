import Link from "next/link";
import { TechnologyMark } from "@/modules/catalog/ui";
import { LandingNote, LandingSectionTitle } from "./landing-note";

const ROW = "grid grid-cols-[22ch_1fr] gap-4 items-baseline border-b border-rule py-4 max-[640px]:grid-cols-1 max-[640px]:gap-2";
const WHO = "flex items-baseline gap-2 font-sans text-body font-semibold";
const VERSION = "font-mono text-diagnostic text-text-muted";
const WHAT = "font-mono text-label leading-[1.7] text-text-muted";
const LINK = "border-b border-dashed border-current whitespace-nowrap text-help no-underline hover:border-solid";

// DESIGN.md, Short Specimen: two more real Releases, one row each, and they are the honest half of
// the argument. A landing that shows only its best case teaches a visitor to distrust the first
// ordinary Release they open. Both figures are countable in a public file: Vite 6.0.0 ships a
// 28-line changelog where the two breaking entries are marked by a single `!`, and the body of the
// TypeScript 5.7.2 release is a link to a blog post, which is the `unavailable` state of a Summary.
// Each row points at the Technology page and not at that one Release: what it shows is how a
// Technology reads when its notes are badly shaped, and that is the list rather than one row of it.
export function ShortSpecimens() {
  return (
    <section aria-labelledby="thin-title">
      <LandingSectionTitle id="thin-title">and when the notes are not that kind</LandingSectionTitle>
      <ul className="max-w-measure border-t border-rule">
        <li className={ROW}>
          <span className={WHO}>
            <TechnologyMark slug="vite" />
            Vite <span className={VERSION}>6.0.0</span>
          </span>
          <span className={WHAT}>
            a changelog of <span className="text-text">28</span> lines, where the two breaking ones
            are marked by a single <code>!</code> and sit between a <code>chore</code> and a{" "}
            <code>perf</code>.{" "}
            <Link href="/technologies/vite" className={LINK}>
              read them apart
            </Link>
          </span>
        </li>
        <li className={ROW}>
          <span className={WHO}>
            <TechnologyMark slug="typescript" />
            TypeScript <span className={VERSION}>5.7.2</span>
          </span>
          <span className={WHAT}>
            a release whose body is <span className="text-text">a link to a blog post</span>. There is
            nothing here to judge, so Verdict says exactly that and points at where the real notes
            live.{" "}
            <Link href="/technologies/typescript" className={LINK}>
              see that state
            </Link>
          </span>
        </li>
      </ul>
      <LandingNote claim="not enough notes to judge">
        This is the sentence Verdict prints instead of a verdict when the notes only point elsewhere.
        &ldquo;I found no breaking changes&rdquo; and &ldquo;there are no breaking changes&rdquo; are
        different claims, and the second one is never printed in place of the first.
      </LandingNote>
    </section>
  );
}
