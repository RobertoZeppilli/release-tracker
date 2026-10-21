import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";
import { readCatalogDirectory } from "@/modules/catalog/server";
import { SPECIMEN } from "@/modules/landing";
import { Arrivals, Bench, ClosingBlock, HeadingBlock, ProofPanel, ShortSpecimens, VocabularyLegend } from "@/modules/landing/ui";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  const title = t("page.landing.title");

  return {
    ...pageMetadata({
      title,
      description: t("page.landing.description"),
      path: "/",
      type: "website",
      locale: await currentLocale(),
    }),
    // The one page whose title already carries the product name: the layout's `%s · Verdict` would
    // say it twice.
    title: { absolute: title },
  };
}

// No `revalidate` and no dynamic API: the landing is prerendered once per deploy and served as a
// static document, which is the cheapest way to keep its Core Web Vitals in the good band. The one
// figure it reads, the size of the Catalog, comes from the `catalog/` directory, which is the file
// `catalog:sync` itself works from, so the number is countable and changes only with a deploy.
// ⚠️ `getTranslator` reads the language from the root parameter and nothing else, so the page is
// still prerendered: one static document per language, which is what ADR 0008 bought by putting the
// language in the URL instead of in a cookie.
export default async function LandingPage() {
  const catalog = await readCatalogDirectory();
  const t = await getTranslator();

  return (
    <>
      <SiteHeader />
      {/* The landing was the first page at this container and is no longer the only one
          (DESIGN.md, Layout): the 200px that let the argument and the proof stand side by side here
          are now the app's own width. The measures inside it do not move. */}
      <main id="content" className="mx-auto max-w-content px-4 pb-8 sm:px-5">
        <section className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start gap-8 py-8 pb-7 max-[1040px]:grid-cols-1 max-[1040px]:gap-7 max-sm:pt-6">
          <HeadingBlock t={t} />
          <ProofPanel t={t} />
        </section>
        <Bench t={t} />
        <ShortSpecimens t={t} />
        <VocabularyLegend t={t} />
        <ClosingBlock catalogSize={catalog.length} followLimit={FREE_FOLLOW_LIMIT} t={t} />
        <Arrivals />
        <p className="mt-8 flex flex-wrap gap-4 border-t border-rule pt-4 font-mono text-meta text-text-faint">
          <span>verdict:</span>
          <span>{t("landing.foot.read")}</span>
          <a href={SPECIMEN.notesUrl} className="text-link">
            {t("landing.foot.notes", { name: SPECIMEN.technology.slug, version: SPECIMEN.version })}
          </a>
        </p>
      </main>
      <BackToTop />
    </>
  );
}
