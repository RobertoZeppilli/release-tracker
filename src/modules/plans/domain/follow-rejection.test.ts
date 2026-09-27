import { describe, expect, it } from "vitest";
import { FollowRejectedError, followRejectionFor, rejectionOf } from "./follow-rejection";

describe("followRejectionFor", () => {
  it("names the two rules the database imposes", () => {
    expect(followRejectionFor("FLIMT")).toBe("limit");
    expect(followRejectionFor("FRTRD")).toBe("retired");
  });

  it("calls anything else unknown, so a row never fails in silence", () => {
    expect(followRejectionFor("23505")).toBe("unknown");
    expect(followRejectionFor(undefined)).toBe("unknown");
    expect(followRejectionFor("")).toBe("unknown");
  });
});

describe("rejectionOf", () => {
  it("reads the rejection back from the error the mutation threw", () => {
    expect(rejectionOf(new FollowRejectedError("limit", "Ten is the limit"))).toBe("limit");
  });

  it("is null for an error that is not a refused follow", () => {
    expect(rejectionOf(new Error("boom"))).toBeNull();
    expect(rejectionOf(null)).toBeNull();
  });
});
