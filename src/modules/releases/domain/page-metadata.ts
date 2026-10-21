import type { Translator } from "@/modules/i18n";
import type { ReleaseDetail } from "./release-page";

// What the Release page says about itself to a search engine. A ready Summary lends its title and
// nothing else: the description must not assert anything the Summary does not say, so without one
// it holds only what the Release record itself holds, the Version and the day it was published.
export type ReleaseMeta = { title: string; description: string };

export function releaseMeta(
  technologyName: string,
  release: ReleaseDetail,
  t: Translator,
): ReleaseMeta {
  return {
    title: t("page.release.title", { name: technologyName, version: release.version }),
    description: releaseDescription(technologyName, release, t),
  };
}

function releaseDescription(
  technologyName: string,
  release: ReleaseDetail,
  t: Translator,
): string {
  // The Summary lends its title as it is: it is written in English and stays in it (ADR 0008), and
  // a description that paraphrased it would be a claim the Summary does not make.
  const summary = release.summary?.content.title;
  if (summary) return summary;
  const published = t("page.release.published", {
    name: technologyName,
    version: release.version,
    date: isoDay(release.publishedAt),
  });
  // Notes nobody has summarized yet are still the page's content, and saying so claims nothing.
  return release.notes ? t("page.release.notesOnly", { published }) : published;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
