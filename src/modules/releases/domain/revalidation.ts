import { releasePath } from "./release-page";

// A Release identified the way the public pages address it, not by database id.
export type ReleaseRef = { slug: string; version: string };

// The pages a change to these Releases makes stale: the Release itself and its Technology, whose
// Upgrade Path counts read the Summaries, plus the sitemap. Deduplicated, so one batch touching
// many Versions of a Technology revalidates that Technology once.
export function publicPagesFor(refs: ReleaseRef[]): string[] {
  if (refs.length === 0) return [];
  const paths = new Set<string>();
  for (const { slug, version } of refs) {
    paths.add(`/technologies/${slug}`);
    paths.add(releasePath(slug, version));
  }
  // The sitemap lists those same pages with the day each last changed, so it goes stale with them.
  paths.add("/sitemap.xml");
  return [...paths];
}
