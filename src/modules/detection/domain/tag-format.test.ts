import { describe, expect, it } from "vitest";
import { notesTagFor, tagFor, versionFromTag } from "./tag-format";

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
    expect(versionFromTag("bun-v{version}", tagFor("bun-v{version}", "1.4.2") ?? "")).toBe("1.4.2");
  });
});

// TypeScript spells an Anteprima without its patch: `6.0.1-rc` on npm is `v6.0-rc` on GitHub.
const typescript = { tagFormat: "v{version}", prereleaseTagFormat: "v{major}.{minor}-{prerelease}" };
const vite = { tagFormat: "v{version}" };

describe("notesTagFor", () => {
  it.each([
    ["6.0.0-beta", "v6.0-beta"],
    ["6.0.1-rc", "v6.0-rc"],
    ["5.9.0-beta", "v5.9-beta"],
    // A stable Release keeps the plain format, patch and all.
    ["7.0.2", "v7.0.2"],
    ["6.0.3", "v6.0.3"],
  ])("writes TypeScript %s as %s", (version, tag) => {
    expect(notesTagFor(typescript, version)).toBe(tag);
  });

  // A Source that declares no second format spells every Version the one way it knows.
  it.each([
    ["7.1.9", "v7.1.9"],
    ["8.0.0-beta.1", "v8.0.0-beta.1"],
  ])("writes Vite %s as %s, unchanged", (version, tag) => {
    expect(notesTagFor(vite, version)).toBe(tag);
  });
});
