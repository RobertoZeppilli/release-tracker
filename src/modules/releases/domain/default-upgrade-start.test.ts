import { describe, expect, it } from "vitest";
import { defaultUpgradeStart } from "./default-upgrade-start";

function releases(...versions: string[]): { version: string }[] {
  return versions.map((version) => ({ version }));
}

describe("defaultUpgradeStart", () => {
  // The point of the rule: the path that follows contains 8.0.0, the Release that breaks things.
  it("is the last stable Release of the previous major", () => {
    expect(defaultUpgradeStart(releases("7.0.0", "7.1.0", "7.1.9", "8.0.0", "8.3.2"))).toEqual({
      version: "7.1.9",
      reason: "previousMajor",
    });
  });

  it("skips a major with no recorded Release and takes the newest one below the latest", () => {
    expect(defaultUpgradeStart(releases("5.4.0", "7.1.0", "8.0.0"))).toEqual({ version: "7.1.0", reason: "previousMajor" });
  });

  it("ignores Previews, on both ends", () => {
    expect(defaultUpgradeStart(releases("7.1.9", "8.0.0-beta.1", "8.0.0", "9.0.0-rc.1"))).toEqual({
      version: "7.1.9",
      reason: "previousMajor",
    });
  });

  it("falls back to the oldest recorded Release when there is a single major", () => {
    expect(defaultUpgradeStart(releases("8.1.0", "8.2.0", "8.3.2"))).toEqual({ version: "8.1.0", reason: "oldest" });
  });

  // Nothing to upgrade from: the page keeps showing the plain list instead of an empty path.
  it("derives nothing from a single stable Release, or from none at all", () => {
    expect(defaultUpgradeStart(releases("8.3.2"))).toBeNull();
    expect(defaultUpgradeStart(releases("8.3.2", "9.0.0-beta.1"))).toBeNull();
    expect(defaultUpgradeStart(releases("9.0.0-beta.1"))).toBeNull();
    expect(defaultUpgradeStart([])).toBeNull();
  });

  it("reads the Releases in any order", () => {
    expect(defaultUpgradeStart(releases("8.3.2", "7.1.9", "8.0.0", "7.0.0"))).toEqual({
      version: "7.1.9",
      reason: "previousMajor",
    });
  });
});
