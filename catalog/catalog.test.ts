import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATEGORIES, parseCatalog } from "@/modules/catalog";

// Fails CI on an invalid entry; the error names the file and the field.
describe("catalog/", () => {
  it("holds only valid entries", () => {
    const paths = readdirSync("catalog").filter((name) => name.endsWith(".json"));
    const files = paths.map((name) => ({ path: `catalog/${name}`, content: readFileSync(`catalog/${name}`, "utf8") }));
    expect(parseCatalog(files).length).toBe(paths.length);
  });

  // A Category is what the picker groups by, so a group larger than eight rows would put back the
  // long list the grouping exists to break up (issue #86). Eight is the size of `framework`, and
  // growing one past it is a decision to write down, not a thing to discover in the browser.
  it("spreads the Catalog over the Categories, with no group above eight rows", () => {
    const paths = readdirSync("catalog").filter((name) => name.endsWith(".json"));
    const entries = parseCatalog(
      paths.map((name) => ({ path: `catalog/${name}`, content: readFileSync(`catalog/${name}`, "utf8") })),
    );

    for (const category of CATEGORIES) {
      const slugs = entries.filter((entry) => entry.category === category).map((entry) => entry.slug);
      expect(slugs.length, `${category}: ${slugs.join(", ")}`).toBeLessThanOrEqual(8);
    }
    expect(entries.every((entry) => CATEGORIES.includes(entry.category))).toBe(true);
  });
});
