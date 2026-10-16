import { describe, expect, it } from "vitest";
import { barePath, DEFAULT_LOCALE, isLocale, localeAlternates, localePath, LOCALES, stripLocale } from "./locales";

describe("isLocale", () => {
  it("accepts the five published languages", () => {
    expect(LOCALES.every(isLocale)).toBe(true);
  });

  it("rejects anything else, so an unknown prefix stays a path and not a language", () => {
    expect(isLocale("technologies")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale("en-US")).toBe(false);
  });
});

describe("localePath", () => {
  it("leaves English unprefixed, which is the address that was already indexed", () => {
    expect(localePath("en", "/technologies/vite")).toBe("/technologies/vite");
    expect(localePath("en", "/")).toBe("/");
  });

  it("prefixes every other language", () => {
    expect(localePath("it", "/technologies/vite")).toBe("/it/technologies/vite");
    expect(localePath("de", "/")).toBe("/de");
  });
});

describe("stripLocale", () => {
  it("reads the language off a prefixed path", () => {
    expect(stripLocale("/it/technologies/vite")).toEqual({ locale: "it", path: "/technologies/vite" });
    expect(stripLocale("/fr")).toEqual({ locale: "fr", path: "/" });
  });

  it("reads an unprefixed path as English", () => {
    expect(stripLocale("/technologies/vite")).toEqual({ locale: "en", path: "/technologies/vite" });
    expect(stripLocale("/")).toEqual({ locale: "en", path: "/" });
  });

  it("does not mistake a page for a language", () => {
    expect(stripLocale("/dashboard")).toEqual({ locale: "en", path: "/dashboard" });
  });

  it("leaves an explicit /en where it is instead of inventing a redirect", () => {
    expect(stripLocale("/en/faq")).toEqual({ locale: "en", path: "/en/faq" });
  });
});

describe("barePath", () => {
  it("takes any language prefix off, English included", () => {
    // The English one is the whole reason it exists: `usePathname` returns the path the proxy
    // rewrote to, so an English page reads `/en/faq` in the browser.
    expect(barePath("/en/faq")).toBe("/faq");
    expect(barePath("/it/technologies/vite")).toBe("/technologies/vite");
    expect(barePath("/de")).toBe("/");
  });

  it("leaves a path that carries no language where it is", () => {
    expect(barePath("/technologies/vite")).toBe("/technologies/vite");
    expect(barePath("/dashboard")).toBe("/dashboard");
    expect(barePath("/")).toBe("/");
  });
});

describe("localeAlternates", () => {
  it("names one address per language plus x-default, from any of them", () => {
    const fromEnglish = localeAlternates("/faq");
    expect(fromEnglish).toEqual({
      en: "/faq",
      it: "/it/faq",
      fr: "/fr/faq",
      es: "/es/faq",
      de: "/de/faq",
      "x-default": "/faq",
    });
    expect(localeAlternates("/de/faq")).toEqual(fromEnglish);
  });

  it("covers every published language, so adding one cannot be forgotten here", () => {
    const alternates = localeAlternates("/");
    for (const locale of LOCALES) expect(alternates[locale]).toBe(localePath(locale, "/"));
    expect(alternates["x-default"]).toBe(localePath(DEFAULT_LOCALE, "/"));
  });
});
