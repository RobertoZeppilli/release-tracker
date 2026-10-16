import { z } from "zod";

// English first because it is the base: the strings are written in it and every other locale is a
// translation of it (ADR 0008). The order is the one the picker reads in.
export const LOCALES = ["en", "it", "fr", "es", "de"] as const;

export const localeSchema = z.enum(LOCALES);

export type Locale = z.infer<typeof localeSchema>;

// `as const satisfies` and not `: Locale`: annotated as the union it widens to it, and then
// `Exclude<Locale, typeof DEFAULT_LOCALE>` -- the set of languages that are translations, which the
// dictionary registry is typed by -- excludes the whole union and comes out `never`.
export const DEFAULT_LOCALE = "en" as const satisfies Locale;

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

// The path with **any** language prefix taken off, `/en` included. `stripLocale` is the other
// question and deliberately leaves an explicit `/en` where it is, because the proxy has to see it to
// redirect it away; this one asks what page this is, whatever language it is written in.
// ⚠️ It exists because `usePathname` in the browser returns the path the proxy **rewrote to**: on an
// English page it reads `/en/faq`, not `/faq`. The picker built its entries from it and sent a
// reader of `/faq` to `/it/en/faq`, which is a 404. Found by an E2E, invisible to the typecheck.
export function barePath(path: string): string {
  const [, first = "", ...rest] = path.split("/");
  if (!isLocale(first)) return path;
  return rest.length > 0 ? `/${rest.join("/")}` : "/";
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
