import { describe, expect, it } from "vitest";
import { tagFor, versionFromTag } from "./tag-format";

// Real tag formats from the Catalog.
describe("versionFromTag", () => {
  it.each([
    ["v{version}", "v24.11.0", "24.11.0"],
    ["{version}", "1.98.0", "1.98.0"],
    ["php-{version}", "php-8.5.11", "8.5.11"],
    ["bun-v{version}", "bun-v1.4.2", "1.4.2"],
    ["svelte@{version}", "svelte@5.57.1", "5.57.1"],
    ["@sveltejs/kit@{version}", "@sveltejs/kit@2.70.3", "2.70.3"],
  ])("%s reads %s as %s", (format, tag, version) => {
    expect(versionFromTag(format, tag)).toBe(version);
  });

  // A monorepo tags every package in one list, and the release list is shared.
  it.each([
    ["svelte@{version}", "@sveltejs/adapter-node@6.0.0"],
    ["v{version}", "vsix-22.2.0"],
    ["php-{version}", "PHP-8.5"],
    ["v{version}", "v"],
  ])("%s does not read %s", (format, tag) => {
    expect(versionFromTag(format, tag)).toBeNull();
  });

  it("round-trips the tag it writes", () => {
    expect(versionFromTag("bun-v{version}", tagFor("bun-v{version}", "1.4.2"))).toBe("1.4.2");
  });
});
