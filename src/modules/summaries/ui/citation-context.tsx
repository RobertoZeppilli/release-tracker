"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { Citation } from "../domain/citations";

export type CiteSeverity = "breaking" | "note";

// The nonce lets the same pointer redraw its caret: the citation alone would be an unchanged state.
export type ActiveCitation = { citation: Citation; severity: CiteSeverity; nonce: number };

type Store = { active: ActiveCitation | null; show: (citation: Citation, severity: CiteSeverity) => void };

const CitationContext = createContext<Store | null>(null);

// Shared by the Summary's pointers and the release notes below them, which live in different modules.
export function CitationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveCitation | null>(null);
  const show = useCallback((citation: Citation, severity: CiteSeverity) => {
    setActive((previous) => ({ citation, severity, nonce: (previous?.nonce ?? 0) + 1 }));
  }, []);
  const store = useMemo(() => ({ active, show }), [active, show]);
  return <CitationContext.Provider value={store}>{children}</CitationContext.Provider>;
}

export function useCitation(): Store | null {
  return useContext(CitationContext);
}
