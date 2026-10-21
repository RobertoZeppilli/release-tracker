import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor, type Locale } from "@/modules/i18n";
import { audienceFor, entryFaces } from "./entry-copy";

const facesIn = (locale: Locale) => entryFaces(locale, createTranslator(locale, dictionaryFor(locale)));

describe("audienceFor", () => {
  it("names the Dashboard's face only once the session is known to be a Developer's", () => {
    expect(audienceFor("developer")).toBe("developer");
  });

  // Issue #140: the landing is a static document, so the first paint happens before the session is
  // read. The visitor's face is the one it carries, and the one a crawler sees.
  it("serves the visitor's face while the session is unknown, and to a Visitor", () => {
    expect(audienceFor("unknown")).toBe("visitor");
    expect(audienceFor("visitor")).toBe("visitor");
  });
});

describe("entryFaces", () => {
  it("sends a Visitor to the login and back to the Dashboard afterwards", () => {
    expect(facesIn("en").visitor).toEqual({ href: "/login?next=%2Fdashboard", label: "Sign in with GitHub" });
  });

  it("sends a Developer straight to the Dashboard, and says so", () => {
    expect(facesIn("en").developer).toEqual({ href: "/dashboard", label: "Go to your dashboard" });
  });

  // ADR 0008: the landing exists in five languages, and signing in from the Italian one has to come
  // back to the Italian Dashboard, not to the English one. The label moves with the address: a face
  // that kept its English word on an Italian page would be the half-translation this test exists
  // to refuse.
  it("keeps the language on both faces, the label and `next` included", () => {
    expect(facesIn("it")).toEqual({
      visitor: { href: "/it/login?next=%2Fit%2Fdashboard", label: "Accedi con GitHub" },
      developer: { href: "/it/dashboard", label: "Vai alla tua Dashboard" },
    });
  });
});
