// DESIGN.md, The Waiting Rule. **One form, chosen by the user on 2026-10-15**: whatever is on its
// way is drawn as a skeleton of the shape it will have. The Zig-Zag bar that used to run between one
// page and the next is gone, and with it the second vocabulary a reader had to learn. Everything
// about how a skeleton is drawn lives in `globals.css` under `.skeleton-box`, including why it keeps
// moving under `prefers-reduced-motion: reduce`; what lives here is which shapes get one.

// The block itself: a filled rectangle of the size it is given, and nothing else. No border, because
// a border is what identifies a control (DESIGN.md, Colors: `rule-strong` carries that duty) and
// this is not a control yet; the fill is what says "something lands here".
export function SkeletonBox({ className }: { className: string }) {
  return <span aria-hidden className={`skeleton-box block ${className}`} />;
}

// The split both pages behind the login are built on: a 360px column and a flexible one at 1241px
// and above, one column below it. It is copied from `dashboard/page.tsx` and
// `technologies/(catalog)/page.tsx` on purpose: the skeleton has to match what the page will do,
// and a shared constant would let the page change shape without the wait following it.
const SPLIT =
  "grid max-w-content items-start gap-7 min-[1041px]:grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-[1041px]:gap-8";

// The page that has not arrived, in the outline of the page that will. ⚠️ **What it is allowed to
// draw is the frame and only the frame**: the two columns and the panels the page has in every one
// of its states. It never draws a row, a line of text or a count, because those are what the page is
// about to say and a grey block in their shape would be a guess with the authority of a layout
// (DESIGN.md, The Reserved Space Rule). The three blocks on the right say "a column of things goes
// here"; they are not three of anything.
//
// The words are for a reader who is not watching the screen, and they are the whole of what names
// the destination: the blocks themselves are `aria-hidden`, so a screen reader meets one sentence
// and no furniture.
// `opening` is the name of the destination, already translated by the page that waits: this file
// draws shapes and holds no sentence of its own.
export function PageSkeleton({ opening }: { opening: string }) {
  return (
    // `data-waiting="page"` is for the tests and is worth the attribute: with a loading boundary the
    // document holds the wait and the page that is still streaming at the same time, so a test that
    // measures geometry right after `goto` can measure the wait by mistake. `arrived()` in
    // `tests/e2e/fixtures.ts` waits for this to be gone, and the name says what it is waiting for.
    <main id="content" data-waiting="page" className={`mx-auto px-4 pt-5 pb-8 sm:px-5 sm:pt-6 ${SPLIT}`}>
      <p role="status" className="sr-only">
        opening {opening}
      </p>
      {/* The left column is one panel on both pages, and its head is a title over a rule: the title
          block is the only thing inside it, because what follows the rule is a list whose length is
          the page's own answer. */}
      <div className="flex flex-col gap-4">
        <SkeletonBox className="h-[34px] w-[220px] max-w-full rounded-md" />
        <SkeletonBox className="h-[260px] w-full rounded-md" />
      </div>
      <div className="flex flex-col gap-4">
        <SkeletonBox className="h-[24px] w-[160px] rounded-md" />
        <SkeletonBox className="h-[132px] w-full rounded-md" />
        <SkeletonBox className="h-[132px] w-full rounded-md" />
        <SkeletonBox className="h-[132px] w-full rounded-md" />
      </div>
    </main>
  );
}
