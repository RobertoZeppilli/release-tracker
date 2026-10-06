"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { Citation } from "../domain/citations";

export type CiteSeverity = "breaking" | "note";

// Which diagnostic cited: the id to return to and the label it is written with, so the notes can
// name the way back instead of a generic "back to top" (issue #85).
export type CiteOrigin = { id: string; label: string };

// The nonce lets the same pointer redraw its caret: the citation alone would be an unchanged state.
export type ActiveCitation = { citation: Citation; severity: CiteSeverity; origin: CiteOrigin; nonce: number };

type Store = {
  active: ActiveCitation | null;
  show: (citation: Citation, severity: CiteSeverity, origin: CiteOrigin) => void;
};

const CitationContext = createContext<Store | null>(null);

// Shared by the Summary's pointers and the release notes below them, which live in different modules.
export function CitationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveCitation | null>(null);
  const show = useCallback((citation: Citation, severity: CiteSeverity, origin: CiteOrigin) => {
    setActive((previous) => ({ citation, severity, origin, nonce: (previous?.nonce ?? 0) + 1 }));
  }, []);
  const store = useMemo(() => ({ active, show }), [active, show]);
  return <CitationContext.Provider value={store}>{children}</CitationContext.Provider>;
}

export function useCitation(): Store | null {
  return useContext(CitationContext);
}
