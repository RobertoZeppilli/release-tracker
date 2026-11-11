import { describe, expect, it } from "vitest";
import { FollowRejectedError, followRejectionFor, rejectionOf } from "./follow-rejection";

describe("followRejectionFor", () => {
  it("names the rule the database imposes", () => {
    expect(followRejectionFor("FRTRD")).toBe("retired");
  });

  it("calls anything else unknown, so a row never fails in silence", () => {
    expect(followRejectionFor("23505")).toBe("unknown");
    expect(followRejectionFor(undefined)).toBe("unknown");
    expect(followRejectionFor("")).toBe("unknown");
  });

  // The Free Plan's limit raised 'FLIMT' until issue #209. The code is gone from the database with
  // the Plan, and a row that somehow still raised it must not be read as a rule the page can
  // explain: `unknown` says to try again, which is the truth about a code nothing issues.
  it("no longer knows the Free Plan's limit", () => {
    expect(followRejectionFor("FLIMT")).toBe("unknown");
  });
});

describe("rejectionOf", () => {
  it("reads the rejection back from the error the mutation threw", () => {
    expect(rejectionOf(new FollowRejectedError("retired", "It has left the Catalog"))).toBe("retired");
  });

  it("is null for an error that is not a refused follow", () => {
    expect(rejectionOf(new Error("boom"))).toBeNull();
    expect(rejectionOf(null)).toBeNull();
  });
});
