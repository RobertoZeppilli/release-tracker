"use client";

import { useEffect } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

// DESIGN.md, The Bench: as the `cite` stage comes into view the caret underline draws beneath the
// quoted span, once, and under reduced motion it is simply there. The stage is below the fold, so
// animating on mount would spend the page's only motion moment where nobody is looking.
//
// The two states are written on the well as a `data-draw` attribute: `armed` clips the caret run,
// `drawn` releases it. The markup the server sends carries neither, so with JavaScript off, or
// before it runs, the carets are already drawn; holding the clip in React would mean rendering it
// before it could be animated, which is the one order that can hide them for good. Nothing is
// rendered here, which is why it is a sibling of the well rather than the well itself.
export function CaretDraw({ target }: { target: string }) {
  useEffect(() => {
    const node = document.getElementById(target);
    if (!node || window.matchMedia(REDUCED).matches) return;
    node.dataset.draw = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        node.dataset.draw = "drawn";
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return null;
}
