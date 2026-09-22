import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "./catalog-entry";
import { planCatalogSync, type StoredTechnology } from "./plan-catalog-sync";

const vite: CatalogEntry = {
  slug: "vite",
  name: "Vite",
  description: "Frontend build tool",
  classificationStrategy: "semver",
  sources: [
    { role: "detection", kind: "npm", package: "vite" },
    { role: "notes", kind: "github-releases", repo: "vitejs/vite", tagFormat: "v{version}" },
  ],
};

function stored(entry: CatalogEntry, overrides: Partial<StoredTechnology> = {}): StoredTechnology {
  return {
    ...entry,
    id: `id-${entry.slug}`,
    retired: false,
    sources: entry.sources.map((source, index) => ({ ...source, id: `${entry.slug}-source-${index}` })),
    ...overrides,
  };
}

describe("planCatalogSync", () => {
  it("inserts a Technology that is only in the repository", () => {
    expect(planCatalogSync([vite], [])).toEqual([{ type: "insert", entry: vite }]);
  });

  it("does nothing when the database already matches the repository", () => {
    expect(planCatalogSync([vite], [stored(vite)])).toEqual([]);
  });

  it.each<[string, Partial<StoredTechnology>]>([
    ["name", { name: "vite" }],
    ["description", { description: "Old description" }],
    ["Source configuration", { sources: [{ role: "detection", kind: "npm", package: "vite-old", id: "s1" }] }],
  ])("updates a Technology whose %s changed in the repository", (_, change) => {
    expect(planCatalogSync([vite], [stored(vite, change)])).toEqual([
      { type: "update", technologyId: "id-vite", entry: vite, removedSourceIds: [] },
    ]);
  });

  it("lists the Sources removed from the repository file", () => {
    const withoutNotes = { ...vite, sources: vite.sources.slice(0, 1) };
    expect(planCatalogSync([withoutNotes], [stored(vite)])).toEqual([
      { type: "update", technologyId: "id-vite", entry: withoutNotes, removedSourceIds: ["vite-source-1"] },
    ]);
  });

  it("retires a Technology whose file left the repository", () => {
    expect(planCatalogSync([], [stored(vite)])).toEqual([{ type: "retire", technologyId: "id-vite" }]);
  });

  it("leaves an already retired Technology alone", () => {
    expect(planCatalogSync([], [stored(vite, { retired: true })])).toEqual([]);
  });

  it("brings back a retired Technology whose file returned", () => {
    expect(planCatalogSync([vite], [stored(vite, { retired: true })])).toEqual([
      { type: "update", technologyId: "id-vite", entry: vite, removedSourceIds: [] },
    ]);
  });

  it("never deletes, whatever changed", () => {
    const react = { ...vite, slug: "react", name: "React" };
    const svelte = { ...vite, slug: "svelte", name: "Svelte" };
    const operations = planCatalogSync([vite, svelte], [stored(vite, { name: "old" }), stored(react)]);
    expect(operations.map((operation) => operation.type).sort()).toEqual(["insert", "retire", "update"]);
  });
});
