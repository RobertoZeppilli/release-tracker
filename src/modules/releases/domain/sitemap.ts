import { releasePath } from "./release-page";

export type SitemapTechnology = { id: string; slug: string; lastModified: Date };
export type SitemapRelease = { technologyId: string; version: string; lastModified: Date };
export type SitemapPage = { path: string; lastModified: Date };

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
      lastModified: latest && latest > technology.lastModified ? latest : technology.lastModified,
    });
    for (const release of own) {
      pages.push({ path: releasePath(technology.slug, release.version), lastModified: release.lastModified });
    }
  }
  return pages;
}
