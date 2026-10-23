"use client";

import { useEffect, useRef } from "react";

export const PHONE = "(max-width: 639px)";

// One element in two shapes means the panel always holds the rows of the other shape, hidden by the
// breakpoint: above 640px a sheet's close button is at `display: none`. `.focus()` on something that
// is not rendered does nothing, so the focus would stay on the trigger and the next Tab would land
// outside the panel.
export function inside(panel: HTMLElement | null): HTMLElement[] {
  const items = [...(panel?.querySelectorAll<HTMLElement>("a, button") ?? [])];
  return items.filter((item) => item.getClientRects().length > 0);
}

// What the account panel and the Notification panel both are: a panel hanging from the bar above
// 640px, a sheet over the whole screen below it. The behaviour is the same in both and it is the
// half that is easy to get wrong, so it is written once rather than twice (WCAG 2.2 AA 2.4.11).
//
// `frame` goes on the box that holds the trigger **and** the panel: it is what a pointer may land
// inside without closing, and where the keys are listened for. `panel` goes on the panel itself.
export function useSheet(open: boolean, close: () => void) {
  const frame = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // A panel over the page closes when the page is used: anything outside it takes the click back.
  // On a phone there is no outside, since the sheet covers the page, and the close button is the way.
  useEffect(() => {
    if (!open) return;
    function onPointerDown({ target }: PointerEvent) {
      if (target instanceof Node && frame.current?.contains(target)) return;
      close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // The sheet covers the page, so the page behind it must not scroll under it. Above 640px the panel
  // is not modal and neither this nor the Tab loop applies.
  useEffect(() => {
    if (!open || !window.matchMedia(PHONE).matches) return;
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = was;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inside(panel.current)[0]?.focus();
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && open) {
      close();
      return;
    }
    if (event.key !== "Tab" || !open || !window.matchMedia(PHONE).matches) return;
    const items = inside(panel.current);
    const edge = event.shiftKey ? items[0] : items[items.length - 1];
    if (document.activeElement !== edge) return;
    event.preventDefault();
    (event.shiftKey ? items[items.length - 1] : items[0])?.focus();
  }

  return { frame, panel, onKeyDown };
}
