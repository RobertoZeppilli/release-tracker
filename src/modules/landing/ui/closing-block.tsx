import { HelpPointer } from "@/components/help-pointer";
import { EntryAction } from "./entry-action";
import { LandingNote } from "./landing-note";

// The close, on the same split the page opened on: the invitation on the left, the counter-position
// on the right. What the product is not has no band of its own any more (DESIGN.md,
// Counter-Position Note): a whole band gave the counter-argument the weight of the demonstration,
// and beside the closing claim it is read by whoever is still weighing the decision.
//
// The two actions appear here for the second and last time: the first screen has them and the page
// ends with them, and nowhere in between.
export function ClosingBlock({ catalogSize, followLimit }: { catalogSize: number; followLimit: number }) {
  return (
    <div
      data-arrival=""
      className="grid grid-cols-2 items-start gap-8 border-t border-rule pt-8 max-[1040px]:grid-cols-1 max-[1040px]:gap-7"
    >
      <div>
        <p className="max-w-[22ch] font-mono text-status">
          Follow the {followLimit} technologies that decide your week.
        </p>
        <p className="mt-4 font-sans text-body text-text-muted">
          The free plan follows up to {followLimit} technologies from a curated catalog of{" "}
          {catalogSize}. Sign-in is GitHub, and the release pages stay readable without it.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <EntryAction />
          <HelpPointer href="/technologies">browse all {catalogSize} technologies</HelpPointer>
        </div>
      </div>
      <LandingNote claim="it does not open pull requests" flush>
        Dependabot and Renovate do that well, and they tell you a version moved. A newsletter tells
        you a release was interesting. Verdict answers the question those leave open: does this
        release ask something of me, and where does it say so. It reads only the release notes, it
        never guesses, and when the notes say nothing it says nothing.
      </LandingNote>
    </div>
  );
}
