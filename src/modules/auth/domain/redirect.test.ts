import { describe, expect, it } from "vitest";
import { DEFAULT_REDIRECT, loginPath, safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("keeps an internal path, with its query and hash", () => {
    expect(safeRedirectPath("/technologies")).toBe("/technologies");
    expect(safeRedirectPath("/technologies/vite?from=8.0.0#L12")).toBe("/technologies/vite?from=8.0.0#L12");
  });

  it("falls back when there is nothing to go back to", () => {
    expect(safeRedirectPath(null)).toBe(DEFAULT_REDIRECT);
    expect(safeRedirectPath(undefined)).toBe(DEFAULT_REDIRECT);
    expect(safeRedirectPath("")).toBe(DEFAULT_REDIRECT);
  });

  it("refuses anything that can leave the site", () => {
    for (const value of [
      "https://evil.test",
      "http://evil.test",
      "//evil.test",
      "///evil.test",
      "/\\evil.test",
      "\\\\evil.test",
      "javascript:alert(1)",
      "technologies",
      "/tech\nnologies",
      "/tech\tnologies",
    ]) {
      expect(safeRedirectPath(value)).toBe(DEFAULT_REDIRECT);
    }
  });
});

describe("loginPath", () => {
  it("encodes the path to come back to", () => {
    expect(loginPath("/technologies/vite?from=8.0.0")).toBe("/login?next=%2Ftechnologies%2Fvite%3Ffrom%3D8.0.0");
  });

  it("never carries an external target", () => {
    expect(loginPath("//evil.test")).toBe(`/login?next=${encodeURIComponent(DEFAULT_REDIRECT)}`);
  });
});
