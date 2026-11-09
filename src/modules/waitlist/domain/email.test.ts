import { describe, expect, it } from "vitest";
import { MAX_EMAIL, normalizeEmail } from "./email";

describe("normalizeEmail", () => {
  it("trims and lower cases, so one address is one Signup", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("keeps an address that is already normalized", () => {
    expect(normalizeEmail("ada@example.com")).toBe("ada@example.com");
  });

  it("refuses what is not an address", () => {
    for (const value of ["", "   ", "ada", "ada@", "@example.com", "ada example.com", "ada@example"])
      expect(normalizeEmail(value)).toBeNull();
  });

  // The field is read off a `FormData`, which answers with `null` or a `File` as readily as a string.
  it("refuses what is not a string at all", () => {
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
  });

  it("refuses an address past the length an SMTP server has to accept", () => {
    const long = `${"a".repeat(MAX_EMAIL)}@example.com`;
    expect(normalizeEmail(long)).toBeNull();
  });
});
