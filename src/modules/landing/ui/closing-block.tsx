import { HelpPointer } from "@/components/help-pointer";
import { LandingNote, LandingSectionTitle } from "./landing-note";
import { SignInButton } from "./sign-in-button";

// The counter-position and the close. The two actions appear here for the second and last time: the
// bench ends with them and the page ends with them, and nowhere in between (DESIGN.md, The Bench).
export function ClosingBlock({ catalogSize, followLimit }: { catalogSize: number; followLimit: number }) {
  return (
    <>
      <section aria-labelledby="not-title">
        <LandingSectionTitle id="not-title">what this is not</LandingSectionTitle>
        <LandingNote claim="it does not open pull requests">
          Dependabot and Renovate do that well, and they tell you a version moved. A newsletter tells
          you a release was interesting. Verdict answers the question those leave open: does this
          release ask something of me, and where does it say so. It reads only the release notes, it
          never guesses, and when the notes say nothing it says nothing.
        </LandingNote>
      </section>

      <div className="mt-8 max-w-measure border-t border-rule pt-5">
        <p className="font-mono text-status">Follow the {followLimit} technologies that decide your week.</p>
        <p className="mt-3 font-sans text-body text-text-muted">
          The free plan follows up to {followLimit} technologies from a curated catalog of{" "}
          {catalogSize}. Sign-in is GitHub, and the release pages stay readable without it.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <SignInButton />
          <HelpPointer href="/technologies">browse all {catalogSize} technologies</HelpPointer>
        </div>
      </div>
    </>
  );
}
