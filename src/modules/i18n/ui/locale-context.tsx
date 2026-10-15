"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "../domain/locales";

// `next/root-params` reads the language on the server, and nothing reads it in the browser: a
// Client Component cannot call it. This context is that half, written once in the root layout, so
// a link or a picker deep in the tree never has to be handed the language as a prop.
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
