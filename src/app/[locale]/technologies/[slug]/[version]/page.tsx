import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { HelpPointer } from "@/components/help-pointer";
import { PageBreadcrumb, technologiesCrumb } from "@/components/breadcrumb";
import { BackToTop } from "@/components/back-to-top";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";
import { createPublicClient } from "@/lib/supabase";
import type { Translator } from "@/modules/i18n";
import { githubRepo, type StoredTechnology } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import { RetiredNote } from "@/modules/catalog/ui";
import { noteLines, releaseMeta, releasePath, versionFromPath } from "@/modules/releases";
import { getRelease } from "@/modules/releases/server";
import { type ExternalSource, OriginalLanguageNote, ReleaseHeader, ReleaseNotesSource, SummaryStatusBlock } from "@/modules/releases/ui";
import { CitationProvider, SummaryView } from "@/modules/summaries/ui";

// ISR with no expiry: a recorded Release does not change, so the first render is the final one and
// `revalidateReleasePages` is the only thing that drops it, as soon as a Summary settles. An hourly
// expiry rewrote every crawled page up to 24 times a day, and the cache holds thousands of them.
export const revalidate = false;

export function generateStaticParams(): { slug: string; version: string }[] {
  return [];
}

type Props = { params: Promise<{ slug: string; version: string }> };

// Cached per request, so the page and its metadata share the queries.
const loadPage = cache(async (slug: string, segment: string) => {
  const version = versionFromPath(segment);
  if (version === null) return null;
  const db = createPublicClient();
  const technology = await getTechnology(db, slug);
  if (!technology) return null;
  const release = await getRelease(db, technology.id, version);
  return release ? { technology, release } : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, version } = await params;
  const page = await loadPage(slug, version);
  if (!page) return {};
  return pageMetadata({
    ...releaseMeta(page.technology.name, page.release, await getTranslator()),
    path: releasePath(page.technology.slug, page.release.version),
    locale: await currentLocale(),
    // The Release page is the one page that declares no translations of itself: its body, the
    // Release Notes and the Summary, is not translated (ADR 0008, emendamento del 2026-10-28).
    hreflang: false,
  });
}

// Where to look when a Release has no notes: the commit history if the Technology is on GitHub.
// `GitHub` and `npm` are the names of the places, not words: what is translated is `View on`.
function externalSource(
  technology: StoredTechnology,
  version: string,
  t: Translator,
): ExternalSource | null {
  const repo = githubRepo(technology.sources);
  if (repo)
    return { label: t("release.viewOn", { where: "GitHub" }), href: `https://github.com/${repo}/commits` };
  for (const source of technology.sources) {
    if (source.kind === "npm")
      return {
        label: t("release.viewOn", { where: "npm" }),
        href: `https://www.npmjs.com/package/${source.package}/v/${version}`,
      };
  }
  return null;
}

// Lower case, because it is a Help Pointer label and not a button: the provenance row is the one
// place on the page where a link sits beside a static fact in the same faint Mono, so it has to
// declare itself the way the system declares every other link (DESIGN.md, Help Pointer Link).
function notesLinkLabel(url: string, t: Translator): string {
  const { hostname } = new URL(url);
  return t("release.viewOnLower", { where: hostname === "github.com" ? "github" : hostname });
}

export default async function ReleasePage({ params }: Props) {
  const { slug, version } = await params;
  const t = await getTranslator();
  const locale = await currentLocale();
  const page = await loadPage(slug, version);
  if (!page) notFound();
  const { technology, release } = page;
  const source = externalSource(technology, release.version, t);
  const detection = technology.sources.find((item) => item.role === "detection");
  // One reading of the notes for both halves: the citations are located in the text shown below.
  const lines = release.notes ? noteLines(release.notes.body) : null;

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-5 pt-5 pb-8 phone:px-4 phone:pt-4">
        <PageBreadcrumb
          path={[technologiesCrumb(t), { label: technology.slug, href: `/technologies/${technology.slug}` }, release.version]}
        />
        <ReleaseHeader technologyName={technology.name} release={release} source={source} t={t} />
        {technology.retired && <RetiredNote name={technology.name} latest={null} t={t} />}
        {/* The page says it is mixed before the Summary is read, not after (ADR 0008). */}
        <OriginalLanguageNote
          locale={locale}
          t={t}
          hasContent={release.summary !== null || release.notes !== null}
        />
        <CitationProvider>
          {release.summary && (
            <SummaryView summary={release.summary} notes={lines ?? []} unjudged={release.unjudged} t={t} />
          )}
          <SummaryStatusBlock release={release} hasGitHub={githubRepo(technology.sources) !== null} t={t} />
          {lines && release.notes && <ReleaseNotesSource lines={lines} url={release.notes.url} />}
        </CitationProvider>
        <p className="mt-7 flex flex-wrap items-baseline gap-4 font-mono text-meta text-text-faint">
          {release.notes?.url && (
            <HelpPointer href={release.notes.url}>{notesLinkLabel(release.notes.url, t)}</HelpPointer>
          )}
          <span>
            {/* `imported` and `detected` are values of the Release record, and so is the kind of
                the Source: identifiers, not words (GLOSSARY.md, "Codice / UI"). */}
            {release.origin} {release.recordedAt.toISOString().slice(0, 10)}
            {detection && ` ${t("release.via", { source: detection.kind })}`}
          </span>
        </p>
      </main>
      <BackToTop />
    </>
  );
}
