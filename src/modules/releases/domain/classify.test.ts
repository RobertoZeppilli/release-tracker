import { describe, expect, it } from "vitest";
import { classify } from "./classify";

// Real Vite Versions from npm.
describe("classify with the semver strategy", () => {
  it.each([
    ["8.0.0", "featured"],
    ["6.0.0", "featured"],
    ["8.3.0", "notable"],
    ["5.4.0", "notable"],
    ["8.3.1", "digest"],
    ["7.3.6", "digest"],
    ["5.2.14", "digest"],
  ])("%s is %s", (version, significance) => {
    expect(classify(version, "semver")).toBe(significance);
  });

  it.each(["8.0.0-beta.18", "8.3.0-beta.1", "7.0.0-rc.1", "8.3.1-beta.0"])("%s is a preview", (version) => {
    expect(classify(version, "semver")).toBe("preview");
  });

  it.each(["6.0.0-alpha.24", "7.1.0-canary.3", "6.0.0-nightly.20240101", "5.0.0-experimental.1", "4.0.0-next.2"])(
    "%s is excluded",
    (version) => {
      expect(classify(version, "semver")).toBe("excluded");
    },
  );

  it.each(["latest", "v8.0.0", "8.0", ""])("%j is not a Version and is excluded", (version) => {
    expect(classify(version, "semver")).toBe("excluded");
  });
});
