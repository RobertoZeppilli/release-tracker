import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractChangelogSection, headingAnchor } from "./changelog";

// A real excerpt of React's CHANGELOG.md, from 19.2.7 to 19.1.0.
const react = readFileSync(new URL("./fixtures/react-changelog.md", import.meta.url), "utf8");

describe("extractChangelogSection on React's CHANGELOG.md", () => {
  it("returns a patch section without its heading", () => {
    expect(extractChangelogSection(react, "19.2.7")).toEqual({
      heading: "19.2.7 (June 1, 2026)",
      body: [
        "### React Server Components",
        "",
        "- Fixed missing `FormData` entries in Server Actions which regressed in 19.2.6 (@unstubbable [#36566](https://github.com/facebook/react/pull/36566))",
      ].join("\n"),
    });
  });

  it("keeps the subsections of a minor and stops at the next Version", () => {
    const section = extractChangelogSection(react, "19.2.0");
    expect(section?.heading).toBe("19.2.0 (October 1st, 2025)");
    expect(section?.body.startsWith("Below is a list of all new features, APIs, and bug fixes.")).toBe(true);
    expect(section?.body).toContain("### New React Features");
    expect(section?.body).not.toContain("19.1.8");
  });

  it("reads the last section up to the end of the file", () => {
    const section = extractChangelogSection(react, "19.1.0");
    expect(section?.body.startsWith("### Owner Stack")).toBe(true);
    expect(section?.body.endsWith("[#31741](https://github.com/facebook/react/pull/31741)")).toBe(true);
  });

  it.each(["19.3.0", "19.2.9", "19.0.0-rc.1", "19.2"])("finds no section for %s", (version) => {
    expect(extractChangelogSection(react, version)).toBeNull();
  });
});

describe("extractChangelogSection on other heading styles", () => {
  const changelog = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "## [2.1.0] - 2026-03-01",
    "",
    "Added a flag.",
    "",
    "```md",
    "## 2.0.1",
    "```",
    "",
    "## v2.0.0",
    "",
    "Breaking.",
    "## 2.0.0-rc.1",
    "",
    "Candidate.",
  ].join("\n");

  it("reads a Keep a Changelog heading and ignores headings inside code blocks", () => {
    expect(extractChangelogSection(changelog, "2.1.0")?.body).toBe("Added a flag.\n\n```md\n## 2.0.1\n```");
  });

  it("reads a heading with a v prefix", () => {
    expect(extractChangelogSection(changelog, "2.0.0")).toEqual({ heading: "v2.0.0", body: "Breaking." });
  });

  it("tells a Preview apart from its stable Version", () => {
    expect(extractChangelogSection(changelog, "2.0.0-rc.1")?.body).toBe("Candidate.");
  });

  it("treats an empty section as missing", () => {
    expect(extractChangelogSection("## 1.0.0\n\n## 0.9.0\nOld.", "1.0.0")).toBeNull();
  });
});

describe("headingAnchor", () => {
  it.each([
    ["19.2.0 (October 1st, 2025)", "1920-october-1st-2025"],
    ["19.2.7 (June 1, 2026)", "1927-june-1-2026"],
    ["[2.1.0] - 2026-03-01", "210---2026-03-01"],
    ["v2.0.0", "v200"],
  ])("links %j as GitHub does", (heading, anchor) => {
    expect(headingAnchor(heading)).toBe(anchor);
  });
});
