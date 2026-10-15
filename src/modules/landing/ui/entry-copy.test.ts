import { describe, expect, it } from "vitest";
import { audienceFor, entryFaces } from "./entry-copy";

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
    expect(entryFaces("en").visitor).toEqual({ href: "/login?next=%2Fdashboard", label: "Sign in with GitHub" });
  });

  it("sends a Developer straight to the Dashboard, and says so", () => {
    expect(entryFaces("en").developer).toEqual({ href: "/dashboard", label: "Go to your dashboard" });
  });

  // ADR 0008: the landing exists in five languages, and signing in from the Italian one has to come
  // back to the Italian Dashboard, not to the English one.
  it("keeps the language on both faces, `next` included", () => {
    expect(entryFaces("it")).toEqual({
      visitor: { href: "/it/login?next=%2Fit%2Fdashboard", label: "Sign in with GitHub" },
      developer: { href: "/it/dashboard", label: "Go to your dashboard" },
    });
  });
});
