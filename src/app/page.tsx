import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/metadata";
import { readCatalogDirectory } from "@/modules/catalog/server";
import { SPECIMEN } from "@/modules/landing";
import { Bench, ClosingBlock, HeadingBlock, ShortSpecimens, STAGES, StageRail, VocabularyLegend } from "@/modules/landing/ui";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";

const TITLE = "Verdict, understand before you upgrade";

export const metadata: Metadata = {
  ...pageMetadata({
    title: TITLE,
    description:
      "Verdict follows the releases of the technologies in your stack and gives each one a single verdict: whether it asks something of you, what breaks, and how to migrate, with every claim pointing at the line of the release notes it was read from.",
    path: "/",
    type: "website",
  }),
  // The one page whose title already carries the product name: the layout's `%s · Verdict` would
  // say it twice.
  title: { absolute: TITLE },
};

// No `revalidate` and no dynamic API: the landing is prerendered once per deploy and served as a
// static document, which is the cheapest way to keep its Core Web Vitals in the good band. The one
// figure it reads, the size of the Catalog, comes from the `catalog/` directory, which is the file
// `catalog:sync` itself works from, so the number is countable and changes only with a deploy.
export default async function LandingPage() {
  const catalog = await readCatalogDirectory();

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-6 pb-8 sm:px-5 sm:pt-6">
        <HeadingBlock />
        <Bench rail={<StageRail stages={STAGES} />} />
        <ShortSpecimens />
        <VocabularyLegend />
        <ClosingBlock catalogSize={catalog.length} followLimit={FREE_FOLLOW_LIMIT} />
        <p className="mt-7 flex flex-wrap gap-4 font-mono text-meta text-text-faint">
          <span>verdict:</span>
          <span>content read from public release notes</span>
          <a href={SPECIMEN.notesUrl}>
            {SPECIMEN.technology.slug} {SPECIMEN.version} notes
          </a>
        </p>
      </main>
    </>
  );
}
