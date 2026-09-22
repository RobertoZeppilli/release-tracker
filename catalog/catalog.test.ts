import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCatalog } from "@/modules/catalog";

// Fails CI on an invalid entry; the error names the file and the field.
describe("catalog/", () => {
  it("holds only valid entries", () => {
    const paths = readdirSync("catalog").filter((name) => name.endsWith(".json"));
    const files = paths.map((name) => ({ path: `catalog/${name}`, content: readFileSync(`catalog/${name}`, "utf8") }));
    expect(parseCatalog(files).length).toBe(paths.length);
  });
});
