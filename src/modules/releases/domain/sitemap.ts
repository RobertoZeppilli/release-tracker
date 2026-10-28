import { releasePath } from "./release-page";

export type SitemapTechnology = { id: string; slug: string; lastModified: Date };
export type SitemapRelease = { technologyId: string; version: string; lastModified: Date };
// `kind` is what tells the route which pages are declared in all five languages and which only in
// the default one (ADR 0008, emendamento del 2026-10-28): a Release page has the same body word for
// word in every language, so it is declared once. The distinction is here and not read back out of
// the path in the route, where a regular expression over a slug would be guessing.
export type SitemapPage = { path: string; kind: "technology" | "release"; lastModified: Date };

// Every public page, in a stable order: each Technology followed by its Releases, newest first.
// Retired Technologies are in, because their pages stay reachable and keep their Releases.
// A Technology page shows its Releases, so it is as recent as the most recent of them.
export function sitemapPages(technologies: SitemapTechnology[], releases: SitemapRelease[]): SitemapPage[] {
  const pages: SitemapPage[] = [];
  for (const technology of [...technologies].sort((a, b) => (a.slug < b.slug ? -1 : 1))) {
    const own = releases
      .filter((release) => release.technologyId === technology.id)
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    const latest = own[0]?.lastModified;
    pages.push({
      path: `/technologies/${technology.slug}`,
      kind: "technology",
      lastModified: latest && latest > technology.lastModified ? latest : technology.lastModified,
    });
    for (const release of own) {
      pages.push({
        path: releasePath(technology.slug, release.version),
        kind: "release",
        lastModified: release.lastModified,
      });
    }
  }
  return pages;
}
