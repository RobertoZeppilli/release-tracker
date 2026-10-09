import { describe, expect, it } from "vitest";
import { notesTagCandidates, notesTagFor, tagFor, versionFromTag } from "./tag-format";

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

// #137: a `tagFormat` covers one era of a repository, and the variant covers the other.
describe("notesTagCandidates", () => {
  it.each([
    // The configured form first: it is the one that works for the majority of angular's Releases.
    [{ tagFormat: "v{version}" }, "21.0.3", ["v21.0.3", "21.0.3"]],
    [{ tagFormat: "{version}" }, "1.0.0-rc.4", ["1.0.0-rc.4", "v1.0.0-rc.4"]],
    [{ tagFormat: "bun-v{version}" }, "1.4.2", ["bun-v1.4.2", "bun-1.4.2"]],
    [{ tagFormat: "svelte@{version}" }, "5.57.1", ["svelte@5.57.1", "svelte@v5.57.1"]],
    [{ tagFormat: "php-{version}" }, "8.5.11", ["php-8.5.11", "php-v8.5.11"]],
    // The second spelling of an Anteprima gets a variant of its own, patch and all still gone.
    [typescript, "6.0.1-rc", ["v6.0-rc", "6.0-rc"]],
    [typescript, "7.0.2", ["v7.0.2", "7.0.2"]],
  ])("writes %o %s as %o", (source, version, tags) => {
    expect(notesTagCandidates(source, version)).toEqual(tags);
  });

  // A Version whose tag cannot be written at all is nobody's tag, in either form.
  it("writes nothing for a Version the format cannot spell", () => {
    expect(notesTagCandidates({ tagFormat: "v{prerelease}" }, "7.0.2")).toEqual([]);
  });
});
