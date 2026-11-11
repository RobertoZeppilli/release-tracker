"use client";

import { type RefObject, useEffect } from "react";
import { useFollows } from "./follows-provider";

// A press moves the row across the split, so the control that was pressed is torn down in one column
// and built again in the other, and the browser drops the focus on the body. Taking it back is what
// keeps the place of the press (issue #64, DESIGN.md, Catalog Column): the keyboard lands where it
// was pressing and the page scrolls to where the row went, which is the whole reason the row is
// allowed to move. It runs again when the database refuses and the row comes back. Nothing is taken
// from a focus that is still somewhere, so the Technology page and the Dashboard shortlist, where no
// row moves, are untouched.
export function usePressFocus(
  technologyId: string,
  control: RefObject<HTMLElement | null>,
  following: boolean,
): void {
  const press = useFollows().pressedAt(technologyId);

  useEffect(() => {
    if (press === null) return;
    const active = document.activeElement;
    if (active === null || active === document.body) control.current?.focus();
  }, [press, following, control]);
}
