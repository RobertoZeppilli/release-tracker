import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";

const meta = { title: "Vite 6.0.0", description: "What changed", path: "/technologies/vite/6.0.0" } as const;

describe("pageMetadata", () => {
  it("names the page's own address as canonical in the language it is read in", () => {
    expect(pageMetadata({ ...meta, locale: "it" }).alternates?.canonical).toBe("/it/technologies/vite/6.0.0");
    expect(pageMetadata({ ...meta, locale: "en" }).alternates?.canonical).toBe("/technologies/vite/6.0.0");
  });

  it("declares the five addresses of a translated page, English as the default", () => {
    expect(pageMetadata({ ...meta, locale: "it" }).alternates?.languages).toEqual({
      en: "/technologies/vite/6.0.0",
      it: "/it/technologies/vite/6.0.0",
      fr: "/fr/technologies/vite/6.0.0",
      es: "/es/technologies/vite/6.0.0",
      de: "/de/technologies/vite/6.0.0",
      "x-default": "/technologies/vite/6.0.0",
    });
  });

  // ADR 0008, emendamento del 2026-10-28: the Release page declares no translations of itself,
  // because its body is the same word for word in all five languages. Its canonical stays.
  it("declares no translations when `hreflang` is off, and keeps the canonical", () => {
    const alternates = pageMetadata({ ...meta, locale: "it", hreflang: false }).alternates;
    expect(alternates?.languages).toBeUndefined();
    expect(alternates?.canonical).toBe("/it/technologies/vite/6.0.0");
  });
});
