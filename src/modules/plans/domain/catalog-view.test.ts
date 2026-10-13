import { describe, expect, it } from "vitest";
import {
  catalogCount,
  narrowToCategory,
  readLayout,
  readSort,
  sortByLatestRelease,
} from "./catalog-view";
import type { PickerTechnology } from "./picker";

function technology(
  name: string,
  options: Partial<PickerTechnology> = {},
): PickerTechnology {
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

const vite = technology("Vite", { category: "build tool", latestAt: "2026-10-06" });
const react = technology("React", { category: "framework", latestAt: "2026-09-09" });
const vue = technology("Vue", { category: "framework", latestAt: "2026-10-06" });
const nothing = technology("Nothing", { latest: null, latestAt: null });

describe("readLayout and readSort", () => {
  it("reads the two values each choice has, and falls back to the first", () => {
    expect(readLayout("grid")).toBe("grid");
    expect(readLayout("rows")).toBe("rows");
    expect(readSort("release")).toBe("release");
    expect(readSort("name")).toBe("name");
  });

  // What comes back from `localStorage` is whatever was once written there, by this version of the
  // page or by another, so anything else is the default rather than an error.
  it("falls back for a missing value and for one it does not know", () => {
    expect(readLayout(null)).toBe("rows");
    expect(readLayout("masonry")).toBe("rows");
    expect(readSort(null)).toBe("name");
    expect(readSort("distance")).toBe("name");
  });
});

describe("sortByLatestRelease", () => {
  it("puts the newest Release first and breaks a tie by name", () => {
    expect(sortByLatestRelease([react, vue, vite]).map((row) => row.name)).toEqual([
      "Vite",
      "Vue",
      "React",
    ]);
  });

  // An unknown date is not a very old one, but it cannot be placed either: the row goes last rather
  // than claiming a day it has not got.
  it("sends a Technology with no Release at all to the end", () => {
    expect(sortByLatestRelease([nothing, react]).map((row) => row.name)).toEqual([
      "React",
      "Nothing",
    ]);
  });

  it("leaves the rows it was given alone", () => {
    const rows = [react, vite];
    sortByLatestRelease(rows);
    expect(rows.map((row) => row.name)).toEqual(["React", "Vite"]);
  });
});

describe("narrowToCategory", () => {
  it("keeps the whole Catalog when no Category is chosen", () => {
    expect(narrowToCategory([vite, react, vue], null)).toHaveLength(3);
  });

  it("keeps the rows of the one Category, in the order it was given them", () => {
    expect(narrowToCategory([vite, react, vue], "framework").map((row) => row.name)).toEqual([
      "React",
      "Vue",
    ]);
  });
});

describe("catalogCount", () => {
  // The filter belongs to the Catalog and counts the Catalog: the stack is beside it in full view,
  // and a count covering both would print a total neither column holds.
  it("counts the rows it is given, and the matches among them", () => {
    expect(catalogCount([vite, react, vue], "")).toEqual({ shown: 3, total: 3 });
    expect(catalogCount([vite, react, vue], "react")).toEqual({ shown: 1, total: 3 });
    expect(catalogCount([vite, react, vue], "qwik")).toEqual({ shown: 0, total: 3 });
  });

  // Narrowed first, so the total is the Category's own: the line says `5 of 8 match in framework`
  // and both numbers are about the same set.
  it("counts inside a chosen Category when it is narrowed first", () => {
    const narrowed = narrowToCategory([vite, react, vue], "framework");
    expect(catalogCount(narrowed, "")).toEqual({ shown: 2, total: 2 });
    expect(catalogCount(narrowed, "vue")).toEqual({ shown: 1, total: 2 });
  });
});
