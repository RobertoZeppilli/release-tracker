import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor, type Locale } from "@/modules/i18n";
import { entryFace } from "./entry-copy";

const faceIn = (locale: Locale) => entryFace(locale, createTranslator(locale, dictionaryFor(locale)));

describe("entryFace", () => {
  it("sends the reader straight to the Dashboard, and says so", () => {
    expect(faceIn("en")).toEqual({ href: "/dashboard", label: "Go to your dashboard" });
  });

  // ADR 0008: the landing exists in five languages, and the Italian one has to open the Italian
  // Dashboard, not the English one. The label moves with the address: a face that kept its English
  // word on an Italian page would be the half-translation this test exists to refuse.
  it("keeps the language on the address and on the label", () => {
    expect(faceIn("it")).toEqual({ href: "/it/dashboard", label: "Vai alla tua Dashboard" });
  });
});
