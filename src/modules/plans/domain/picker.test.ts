import { describe, expect, it } from "vitest";
import {
  groupByCategory,
  liveSections,
  matchesQuery,
  type PickerTechnology,
  splitPicker,
} from "./picker";

function technology(name: string, options: Partial<PickerTechnology> = {}): PickerTechnology {
  const slug = name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return {
    id: `id-${slug}`,
    slug,
    name,
    description: `${name} description`,
    latest: "1.0.0",
    latestAt: "2026-01-01",
    retired: false,
    category: "library",
    ...options,
  };
}

const vite = technology("Vite", { description: "frontend build tool" });
const react = technology("React", { description: "library for web and native UIs" });
const angular = technology("Angular");
const cra = technology("Create React App", { retired: true });

describe("splitPicker", () => {
  it("puts the followed Technologies first, then the rest of the Catalog, both alphabetical", () => {
    const sections = splitPicker([vite, angular, react], [react.id]);

    expect(sections.following.map((entry) => entry.name)).toEqual(["React"]);
    expect(sections.catalog.map((entry) => entry.name)).toEqual(["Angular", "Vite"]);
    expect(sections.retired).toEqual([]);
  });

  it("shows a retired Technology only while it is followed", () => {
    expect(splitPicker([vite, cra], [vite.id]).retired).toEqual([]);

    const followed = splitPicker([vite, cra], [vite.id, cra.id]);
    expect(followed.retired.map((entry) => entry.name)).toEqual(["Create React App"]);
    // A retired Technology never joins the two sections that offer a Follow.
    expect([...followed.following, ...followed.catalog].map((entry) => entry.name)).toEqual(["Vite"]);
  });

  it("ignores a follow of a Technology that is no longer in the Catalog", () => {
    expect(splitPicker([vite], ["id-gone"]).following).toEqual([]);
  });
});

describe("matchesQuery", () => {
  it("matches the name and the description, ignoring case and surrounding spaces", () => {
    expect(matchesQuery(vite, "vit")).toBe(true);
    expect(matchesQuery(vite, "  BUILD  ")).toBe(true);
    expect(matchesQuery(vite, "qwik")).toBe(false);
  });

  it("matches everything while the filter is empty", () => {
    expect(matchesQuery(vite, "")).toBe(true);
    expect(matchesQuery(vite, "   ")).toBe(true);
  });
});

describe("liveSections", () => {
  // What the visit started with: React and Create React App followed, Vite and Angular not.
  const sections = splitPicker([vite, react, angular, cra], [react.id, cra.id]);

  it("moves a Technology followed during the visit into the count of `following`", () => {
    const live = liveSections(sections, [react.id, cra.id, vite.id]);

    expect(live.following.map((row) => row.name)).toEqual(["React", "Vite"]);
    expect(live.catalog.map((row) => row.name)).toEqual(["Angular"]);
  });

  it("takes a Technology unfollowed during the visit out of `following`", () => {
    const live = liveSections(sections, [cra.id]);

    expect(live.following).toEqual([]);
    expect(live.catalog.map((row) => row.name)).toEqual(["Angular", "React", "Vite"]);
  });

  // A retired Technology nobody follows can never be followed again, so it belongs nowhere.
  it("drops a retired Technology once it is let go", () => {
    expect(liveSections(sections, [react.id]).retired).toEqual([]);
  });

  it("says what the visit found when nothing has been toggled", () => {
    const live = liveSections(sections, [react.id, cra.id]);

    expect(live.following.map((row) => row.name)).toEqual(sections.following.map((row) => row.name));
    expect(live.catalog.map((row) => row.name)).toEqual(sections.catalog.map((row) => row.name));
    expect(live.retired.map((row) => row.name)).toEqual(sections.retired.map((row) => row.name));
  });
});

describe("groupByCategory", () => {
  const rows = [
    technology("Vite", { category: "build tool" }),
    technology("Zod", { category: "library" }),
    technology("React", { category: "framework" }),
    technology("TypeScript", { category: "language" }),
    technology("Vue", { category: "framework" }),
  ];

  // Not alphabetical by Category: the order is the one CONTEXT.md declares, from the language to the
  // platform, because the Catalog is read to put a stack together.
  it("keeps the declared order of the Categories, and the row order inside each", () => {
    expect(groupByCategory(rows)).toEqual([
      { category: "language", rows: [rows[3]] },
      { category: "framework", rows: [rows[2], rows[4]] },
      { category: "build tool", rows: [rows[0]] },
      { category: "library", rows: [rows[1]] },
    ]);
  });

  it("leaves out a Category with no row to show, rather than an empty group", () => {
    expect(groupByCategory([rows[1]])).toEqual([{ category: "library", rows: [rows[1]] }]);
  });

  it("has nothing to group when the Catalog section is empty", () => {
    expect(groupByCategory([])).toEqual([]);
  });

  // Every row lands in exactly one group: a Technology has one Category and there is no "other".
  it("holds every row once", () => {
    const grouped = groupByCategory(rows).flatMap((group) => group.rows);

    expect(grouped).toHaveLength(rows.length);
    expect(new Set(grouped.map((row) => row.id)).size).toBe(rows.length);
  });
});
