"use client";

import { createContext, type ReactNode, useContext } from "react";

// A start for the Upgrade Path that the reader did not type on this visit, declared somewhere else
// and standing since a day this page has to name. What declares it is not this module's business:
// the path only needs the Version and the day, so whoever knows about declarations fills it in.
export type UpgradeStart = { version: string; declaredAt: Date };

const UpgradeStartContext = createContext<UpgradeStart | null>(null);

export function UpgradeStartProvider({ start, children }: { start: UpgradeStart | null; children: ReactNode }) {
  return <UpgradeStartContext.Provider value={start}>{children}</UpgradeStartContext.Provider>;
}

// Null on a page that has no declared start, which is every public visit: the path then waits for a
// Version to be typed, exactly as it did before there was anything to declare.
export function useUpgradeStart(): UpgradeStart | null {
  return useContext(UpgradeStartContext);
}
