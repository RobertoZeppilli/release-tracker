"use client";

import { useEffect } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
// The same line the arrival is measured against everywhere: a band arrives once its top has come up
// into the lower eighth of the window, not the instant its first pixel appears.
const REACH = 0.88;

// DESIGN.md, The Arrival Rule: on the landing a band arrives once, 10px and a fade, and then is
// forgotten. Like the caret draw it is written as an attribute the client sets, never as markup the
// server sends: with JavaScript off, or before it runs, every band is simply there, which is also
// what a crawler reads. Nothing is rendered here, so the component is a sibling of the bands.
//
// A band already on the screen when this runs is never armed. Arming it would hide something the
// reader can see and fade it back in, which is the one thing an arrival may not do, and hydration
// is exactly when that would happen.
//
// The sweep is a scroll listener and not an IntersectionObserver, which is what this was first
// written as. An observer only speaks when a threshold is crossed, and a reader who presses End or
// follows an anchor moves a band from under the window to over it without crossing anything: no
// callback is delivered, and the band stays hidden for the rest of the visit. Reading the rectangle
// of the few bands still waiting costs nothing and cannot miss a jump.
export function Arrivals() {
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    let waiting = [...document.querySelectorAll<HTMLElement>("[data-arrival]")].filter(
      (band) => band.getBoundingClientRect().top > window.innerHeight,
    );
    for (const band of waiting) band.dataset.arrival = "armed";
    if (waiting.length === 0) return;

    function sweep() {
      const reach = window.innerHeight * REACH;
      waiting = waiting.filter((band) => {
        if (band.getBoundingClientRect().top > reach) return true;
        band.dataset.arrival = "in";
        return false;
      });
      if (waiting.length === 0) window.removeEventListener("scroll", onScroll);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        sweep();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
