import { describe, expect, it } from "vitest";
import { audienceFor, ENTRY_FACES } from "./entry-copy";

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

describe("ENTRY_FACES", () => {
  it("sends a Visitor to the login and back to the Dashboard afterwards", () => {
    expect(ENTRY_FACES.visitor).toEqual({ href: "/login?next=%2Fdashboard", label: "Sign in with GitHub" });
  });

  it("sends a Developer straight to the Dashboard, and says so", () => {
    expect(ENTRY_FACES.developer).toEqual({ href: "/dashboard", label: "Go to your dashboard" });
  });
});
