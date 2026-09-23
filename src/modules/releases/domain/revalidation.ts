import { releasePath } from "./release-page";

// A Release identified the way the public pages address it, not by database id.
export type ReleaseRef = { slug: string; version: string };

// The pages a change to these Releases makes stale: the Release itself and its Technology, whose
// Upgrade Path counts read the Summaries. Deduplicated, so one batch touching many Versions of a
// Technology revalidates that Technology once.
export function publicPagesFor(refs: ReleaseRef[]): string[] {
  const paths = new Set<string>();
  for (const { slug, version } of refs) {
    paths.add(`/technologies/${slug}`);
    paths.add(releasePath(slug, version));
  }
  return [...paths];
}
