"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "../domain/locales";
import type { Dictionary } from "../domain/message";
import { createTranslator, type Translator } from "../domain/translate";

type LocaleValue = { locale: Locale; dictionary: Dictionary };

// `next/root-params` reads the language on the server, and nothing reads it in the browser: a
// Client Component cannot call it. This context is that half, written once in the root layout, so
// a link or a picker deep in the tree never has to be handed the language as a prop.
// It carries the dictionary with the language because `t` is needed on this side of the boundary
// too, and a client component that imported the dictionaries itself would pull **all five** into
// the bundle: the one being read arrives as a prop instead, already merged over English.
const LocaleContext = createContext<LocaleValue>({ locale: DEFAULT_LOCALE, dictionary: {} });

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useTranslator(): Translator {
  const { locale, dictionary } = useContext(LocaleContext);
  return useMemo(() => createTranslator(locale, dictionary), [locale, dictionary]);
}
