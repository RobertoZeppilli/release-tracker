"use client";

import type { ReactNode } from "react";

// Jumping to a closed <details> does not open it: the link opens the notes before the browser scrolls.
export function OpenNotesLink({ className, children }: { className: string; children: ReactNode }) {
  function open() {
    const notes = document.getElementById("release-notes");
    if (notes instanceof HTMLDetailsElement) notes.open = true;
  }
  return (
    <a href="#release-notes" onClick={open} className={className}>
      {children}
    </a>
  );
}
