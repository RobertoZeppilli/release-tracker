"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CatalogSelection = {
  // The mode, off until it is asked for (DESIGN.md, Select Many).
  on: boolean;
  toggleMode: () => void;
  selected: string[];
  isSelected: (technologyId: string) => boolean;
  select: (technologyId: string) => void;
  clear: () => void;
};

// A page that never offers the mode still renders Catalog rows: the empty Dashboard does. The
// default is the mode switched off and nothing selectable, so a row outside the provider draws no
// mark and asks no question.
const OFF: CatalogSelection = {
  on: false,
  toggleMode: () => {},
  selected: [],
  isSelected: () => false,
  select: () => {},
  clear: () => {},
};

const SelectionContext = createContext<CatalogSelection>(OFF);

// `available` is what the Catalog is holding right now. The selection is kept against it rather
// than beside it: a followed row leaves the column, so the group that was just written empties
// itself, while a group the database refused comes back and stays selected, which is what lets a
// Developer edit the selection instead of building it again (DESIGN.md, Selection Bar).
export function CatalogSelectionProvider({
  available,
  children,
}: {
  available: readonly string[];
  children: React.ReactNode;
}) {
  const [on, setOn] = useState(false);
  const [picked, setPicked] = useState<readonly string[]>([]);

  const here = useMemo(() => new Set(available), [available]);
  const selected = useMemo(() => picked.filter((id) => here.has(id)), [picked, here]);

  const clear = useCallback(() => setPicked([]), []);
  const toggleMode = useCallback(() => {
    setOn((previous) => !previous);
    clear();
  }, [clear]);

  // Escape leaves the mode, because a mode with no way out but the control that opened it is a
  // trap for the keyboard. It is listened for only while the mode is on.
  useEffect(() => {
    if (!on) return;
    const leave = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOn(false);
        clear();
      }
    };
    window.addEventListener("keydown", leave);
    return () => window.removeEventListener("keydown", leave);
  }, [on, clear]);

  const value: CatalogSelection = {
    on,
    toggleMode,
    selected,
    isSelected: (technologyId) => selected.includes(technologyId),
    select: (technologyId) =>
      setPicked((previous) =>
        previous.includes(technologyId)
          ? previous.filter((id) => id !== technologyId)
          : [...previous, technologyId],
      ),
    clear,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useCatalogSelection(): CatalogSelection {
  return useContext(SelectionContext);
}
