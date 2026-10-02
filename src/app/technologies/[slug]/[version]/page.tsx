import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteHeader, TECHNOLOGIES_CRUMB } from "@/components/site-header";
import { createPublicClient } from "@/lib/supabase";
import { githubRepo, type StoredTechnology } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import { RetiredNote } from "@/modules/catalog/ui";
import { noteLines, versionFromPath } from "@/modules/releases";
import { getRelease } from "@/modules/releases/server";
import { type ExternalSource, ReleaseHeader, ReleaseNotesSource, SummaryStatusBlock } from "@/modules/releases/ui";
import { CitationProvider, SummaryView } from "@/modules/summaries/ui";

// ISR like the Technology page: rendered on the first visit, regenerated at most once an hour.
export const revalidate = 3600;

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
  return page ? { title: `${page.technology.name} ${page.release.version} release` } : {};
}

// Where to look when a Release has no notes: the commit history if the Technology is on GitHub.
function externalSource(technology: StoredTechnology, version: string): ExternalSource | null {
  const repo = githubRepo(technology.sources);
  if (repo) return { label: "View on GitHub", href: `https://github.com/${repo}/commits` };
  for (const source of technology.sources) {
    if (source.kind === "npm") return { label: "View on npm", href: `https://www.npmjs.com/package/${source.package}/v/${version}` };
  }
  return null;
}

function notesLinkLabel(url: string): string {
  const { hostname } = new URL(url);
  return hostname === "github.com" ? "View on GitHub" : `View on ${hostname}`;
}

export default async function ReleasePage({ params }: Props) {
  const { slug, version } = await params;
  const page = await loadPage(slug, version);
  if (!page) notFound();
  const { technology, release } = page;
  const source = externalSource(technology, release.version);
  const detection = technology.sources.find((item) => item.role === "detection");
  // One reading of the notes for both halves: the citations are located in the text shown below.
  const lines = release.notes ? noteLines(release.notes.body) : null;

  return (
    <>
      <SiteHeader path={[TECHNOLOGIES_CRUMB, { label: technology.slug, href: `/technologies/${technology.slug}` }, release.version]} />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <ReleaseHeader technologyName={technology.name} release={release} source={source} />
        {technology.retired && <RetiredNote name={technology.name} latest={null} />}
        <CitationProvider>
          {release.summary && <SummaryView summary={release.summary} notes={lines ?? []} />}
          <SummaryStatusBlock release={release} hasGitHub={githubRepo(technology.sources) !== null} />
          {lines && release.notes && <ReleaseNotesSource lines={lines} url={release.notes.url} />}
        </CitationProvider>
        <p className="mt-7 flex flex-wrap gap-4 font-mono text-meta text-text-faint">
          {release.notes?.url && <a href={release.notes.url}>{notesLinkLabel(release.notes.url)}</a>}
          <span>
            {release.origin} {release.recordedAt.toISOString().slice(0, 10)}
            {detection && ` via ${detection.kind}`}
          </span>
        </p>
      </main>
    </>
  );
}
