import type { ReleaseDetail } from "./release-page";

// What the Release page says about itself to a search engine. A ready Summary lends its title and
// nothing else: the description must not assert anything the Summary does not say, so without one
// it holds only what the Release record itself holds, the Version and the day it was published.
export type ReleaseMeta = { title: string; description: string };

export function releaseMeta(technologyName: string, release: ReleaseDetail): ReleaseMeta {
  return {
    title: `${technologyName} ${release.version} release`,
    description: releaseDescription(technologyName, release),
  };
}

function releaseDescription(technologyName: string, release: ReleaseDetail): string {
  const summary = release.summary?.content.title;
  if (summary) return summary;
  const published = `${technologyName} ${release.version}, published ${isoDay(release.publishedAt)}.`;
  // Notes nobody has summarized yet are still the page's content, and saying so claims nothing.
  return release.notes ? `${published} The release notes as published, not yet summarized.` : published;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
