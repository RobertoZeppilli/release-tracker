import { describe, expect, it } from "vitest";
import { countMatches, liveSections, matchesQuery, type PickerTechnology, splitPicker } from "./picker";

function technology(name: string, options: Partial<PickerTechnology> = {}): PickerTechnology {
  const slug = name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return {
    id: `id-${slug}`,
    slug,
    name,
    description: `${name} description`,
    latest: "1.0.0",
    retired: false,
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

describe("countMatches", () => {
  const sections = splitPicker([vite, react, angular, cra], [react.id, cra.id]);

  it("counts across the sections that are shown, retired ones included", () => {
    expect(countMatches(sections, "")).toEqual({ shown: 4, total: 4 });
    expect(countMatches(sections, "react")).toEqual({ shown: 2, total: 4 });
    expect(countMatches(sections, "qwik")).toEqual({ shown: 0, total: 4 });
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
