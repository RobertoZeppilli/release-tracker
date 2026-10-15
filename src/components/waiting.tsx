// DESIGN.md, The Waiting Rule. Two forms of one answer, and they are two because a wait between
// pages and a wait inside a control are not the same thing. Both live here so they cannot drift into
// two different ways of saying "working on it".

// The wait between one page and the next: the Zig-Zag progress bar from css-loaders.com/progress,
// the twelfth there, chosen by the user on 2026-10-15. Six blocks on a track, each flipping from the
// bottom half to the top half one after the other over 2s. Everything it needs is in the class, in
// the system's own ink (`text-faint` on `rule`); what is here is where it sits and what it says.
// It claims no percentage, and that is the honest part: nothing on the client knows how far a server
// render has got. The words under it are a polite live region, for a reader who is not watching it.
export function WaitingBar({ opening }: { opening: string }) {
  return (
    // In the middle of what is left of the screen once the bar has taken its 56px, asked for by the
    // user on 2026-10-15: a wait is the only thing on the page, and the one place that belongs to
    // nothing else is the centre. `min-h` and not `h`, so a short screen is never made to scroll for
    // it, and `56px` is the bar's height at every width (DESIGN.md, Layout).
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-3 px-4">
      <div aria-hidden className="progress-zigzag" />
      <p role="status" className="m-0 font-mono text-label text-text-faint">
        opening {opening}
      </p>
    </div>
  );
}

// The wait inside a control: the box it will fill, filled. The tone is `raised`, which is the fill
// every button of the system already takes under the pointer, and the 1px `rule` is the control's
// own edge: between them the shape is unmistakable at a glance, where `sunken` was measured at
// #0b0d10 against a #0f1115 page and could not be seen at all. Nothing larger than a control is ever
// given one: a skeleton in the outline of a paragraph would claim to know what the page is about to
// say (The Reserved Space Rule).
export function SkeletonBox({ className }: { className: string }) {
  return <span aria-hidden className={`skeleton-box block border border-rule bg-raised ${className}`} />;
}
