import { z } from "zod";

// English first because it is the base: the strings are written in it and every other locale is a
// translation of it (ADR 0008). The order is the one the picker reads in.
export const LOCALES = ["en", "it", "fr", "es", "de"] as const;

export const localeSchema = z.enum(LOCALES);

export type Locale = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE: Locale = "en";

// The name of each language in itself, which is the only name a reader of that language can be
// expected to recognise: a German speaker looking for German looks for `Deutsch`.
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: "English",
  it: "Italiano",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export function isLocale(value: string): value is Locale {
  return localeSchema.safeParse(value).success;
}

// The default locale carries no prefix: `/technologies/vite` is the English page and the address
// that was already indexed (ADR 0008). The others are prefixed.
export function localePath(locale: Locale, path: string): string {
  const rest = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? rest || "/" : `/${locale}${rest}`;
}

// The path without its locale prefix, which is what the picker needs to send the reader to the same
// page in another language, and what the canonical of a page is built from.
export function stripLocale(path: string): { locale: Locale; path: string } {
  const [, first = "", ...rest] = path.split("/");
  if (!isLocale(first) || first === DEFAULT_LOCALE) return { locale: DEFAULT_LOCALE, path };
  const remainder = rest.length > 0 ? `/${rest.join("/")}` : "/";
  return { locale: first, path: remainder };
}

// Every address of one page, for `hreflang`. `x-default` points at the English one: it is what a
// crawler serves to a reader whose language we do not publish.
export function localeAlternates(path: string): Record<string, string> {
  const { path: bare } = stripLocale(path);
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, bare)])),
    "x-default": localePath(DEFAULT_LOCALE, bare),
  };
}
