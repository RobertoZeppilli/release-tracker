import { describe, expect, it } from "vitest";
import { fillVersionTemplate, unknownVersionPlaceholders } from "./version-template";

describe("fillVersionTemplate", () => {
  it.each([
    ["v{version}", "7.0.2", "v7.0.2"],
    ["{version}", "1.98.0", "1.98.0"],
    ["bun-v{version}", "1.4.2", "bun-v1.4.2"],
    ["v{major}.{minor}-{prerelease}", "6.0.0-beta", "v6.0-beta"],
    ["v{major}.{minor}-{prerelease}", "6.0.1-rc", "v6.0-rc"],
    ["v{major}.{minor}", "5.9.3", "v5.9"],
    ["v{major}.{minor}.{patch}", "5.9.3", "v5.9.3"],
    // A prerelease of several identifiers is spelled the way the Version spells it.
    ["v{major}.{minor}-{prerelease}", "7.1.0-dev.20261002.1", "v7.1-dev.20261002.1"],
  ])("%s fills %s as %s", (template, version, tag) => {
    expect(fillVersionTemplate(template, version)).toBe(tag);
  });

  it("refuses a Version that has no prerelease to put in {prerelease}", () => {
    expect(fillVersionTemplate("v{major}.{minor}-{prerelease}", "7.0.2")).toBeNull();
  });

  it("refuses a Version it cannot parse, but only when it needs the parts", () => {
    expect(fillVersionTemplate("v{major}.{minor}", "6.0-beta")).toBeNull();
    expect(fillVersionTemplate("v{version}", "6.0-beta")).toBe("v6.0-beta");
  });
});

describe("unknownVersionPlaceholders", () => {
  it("names what it does not know, and nothing else", () => {
    expect(unknownVersionPlaceholders("v{major}.{minor}-{prerelease}")).toEqual([]);
    expect(unknownVersionPlaceholders("v{version}")).toEqual([]);
    expect(unknownVersionPlaceholders("v{magor}.{min}")).toEqual(["magor", "min"]);
    // A literal brace is not a placeholder, and an empty one is not a part of a Version.
    expect(unknownVersionPlaceholders("v{}")).toEqual([""]);
    expect(unknownVersionPlaceholders("plain-1.0.0")).toEqual([]);
  });
});
