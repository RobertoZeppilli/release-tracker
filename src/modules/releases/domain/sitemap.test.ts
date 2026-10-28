import { describe, expect, it } from "vitest";
import { sitemapPages } from "./sitemap";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

const vite = { id: "t-vite", slug: "vite", lastModified: day("2026-01-01") };
const react = { id: "t-react", slug: "react", lastModified: day("2026-01-02") };

describe("sitemapPages", () => {
  it("lists each Technology by slug, followed by its Releases newest first", () => {
    const pages = sitemapPages(
      [vite, react],
      [
        { technologyId: "t-vite", version: "6.0.0", lastModified: day("2026-02-01") },
        { technologyId: "t-vite", version: "6.0.1", lastModified: day("2026-03-01") },
        { technologyId: "t-react", version: "19.0.0", lastModified: day("2026-01-20") },
      ],
    );
    expect(pages.map((page) => page.path)).toEqual([
      "/technologies/react",
      "/technologies/react/19.0.0",
      "/technologies/vite",
      "/technologies/vite/6.0.1",
      "/technologies/vite/6.0.0",
    ]);
  });

  it("dates a Technology page by its most recent Release", () => {
    const [page] = sitemapPages([vite], [{ technologyId: "t-vite", version: "6.0.0", lastModified: day("2026-04-05") }]);
    expect(page.lastModified).toEqual(day("2026-04-05"));
  });

  it("falls back to the Technology itself when it has no Release", () => {
    expect(sitemapPages([vite], [])).toEqual([
      { path: "/technologies/vite", kind: "technology", lastModified: day("2026-01-01") },
    ]);
  });

  // The route reads `kind` to decide which pages it declares in all five languages and which only
  // in the default one (ADR 0008, emendamento del 2026-10-28), so a Release that came back marked
  // as a Technology page would be ~2.060 paths declared five times again.
  it("says of each page whether it is a Technology page or a Release page", () => {
    const pages = sitemapPages([vite], [{ technologyId: "t-vite", version: "6.0.0", lastModified: day("2026-02-01") }]);
    expect(pages.map((page) => page.kind)).toEqual(["technology", "release"]);
  });

  it("encodes build metadata in the Release path", () => {
    const pages = sitemapPages([vite], [{ technologyId: "t-vite", version: "1.0.0+build.5", lastModified: day("2026-01-03") }]);
    expect(pages.map((page) => page.path)).toContain("/technologies/vite/1.0.0%2Bbuild.5");
  });

  it("ignores a Release whose Technology is not listed", () => {
    expect(sitemapPages([], [{ technologyId: "t-gone", version: "1.0.0", lastModified: day("2026-01-03") }])).toEqual([]);
  });
});
