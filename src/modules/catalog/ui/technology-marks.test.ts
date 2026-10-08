import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TECHNOLOGY_MARKS } from "./technology-marks";

// Technologies left unmarked on purpose; the reasons are in `scripts/sync-technology-marks.mts`.
const UNMARKED = ["playwright", "sveltekit", "zustand"];

const slugs = readdirSync("catalog")
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""));

describe("technology marks", () => {
  it("has a mark for every Technology but the ones left unmarked on purpose", () => {
    const missing = slugs.filter((slug) => !(slug in TECHNOLOGY_MARKS));
    expect(missing.sort()).toEqual(UNMARKED);
  });

  it("has no mark for a Technology that left the Catalog", () => {
    expect(Object.keys(TECHNOLOGY_MARKS).filter((slug) => !slugs.includes(slug))).toEqual([]);
  });

  // CLAUDE.md: no external call from the client. A path is geometry, so anything that could fetch
  // something (a URL, a CSS reference, an `<image>`) has no business being in one.
  it("carries geometry only, with nothing to fetch", () => {
    for (const [slug, path] of Object.entries(TECHNOLOGY_MARKS)) {
      expect(path, slug).not.toMatch(/https?:|url\(|<|&#/i);
      expect(path, slug).toMatch(/^[MmZzLlHhVvCcSsQqTtAa0-9.,\-\s]+$/);
    }
  });
});
