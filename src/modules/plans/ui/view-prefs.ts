"use client";

import { useCallback, useSyncExternalStore } from "react";

// DESIGN.md, The Address Rule: how the Catalog is laid out and how it is ordered are how one reader
// reads, not what the page shows, so they stay out of the address and live in this browser. Every
// read and write is wrapped, because a private window is not a failure, and the stored value is
// parsed by the caller rather than trusted: what comes back from `localStorage` is whatever was once
// written there, by this version of the page or by another.
//
// `localStorage` is an external store, so it is read as one. The server snapshot is the fallback,
// which is what the first paint renders, and the stored choice arrives on hydration without a
// render inside an effect. The listeners also make a write in another tab arrive here, which is the
// same preference being changed by the same reader.
const listeners = new Set<() => void>();
// A private window, or one with site data blocked, throws on both ends of `localStorage`. The
// choice still has to hold for the visit, so it is kept here as well and read from here when the
// store refuses: what is lost is the memory across visits, which is all that was ever promised.
const memory = new Map<string, string>();

export function useViewPref<T extends string>(
  key: string,
  read: (value: string | null) => T,
  fallback: T,
): [T, (value: T) => void] {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }, []);

  const stored = useSyncExternalStore(
    subscribe,
    () => recall(key),
    () => null,
  );

  const choose = useCallback(
    (next: T) => {
      remember(key, next);
      for (const listener of listeners) listener();
    },
    [key],
  );

  return [stored === null ? fallback : read(stored), choose];
}

function recall(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function remember(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* a private window is not a failure */
  }
}
