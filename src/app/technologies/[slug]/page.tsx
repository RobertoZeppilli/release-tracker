import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { PageBreadcrumb, TECHNOLOGIES_CRUMB } from "@/components/breadcrumb";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/metadata";
import { createPublicClient } from "@/lib/supabase";
import { technologyMeta } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import { TechnologyHeader } from "@/modules/catalog/ui";
import { CurrentVersionField, TechnologyFollow, TechnologyScope } from "@/modules/plans/ui";
import { defaultUpgradeStart, groupByMajor } from "@/modules/releases";
import { listReleases } from "@/modules/releases/server";
import { ReleaseList, UpgradePathBlock, UpgradePathView } from "@/modules/releases/ui";

// ISR: no page is built ahead (the build has no database); each is rendered on its first visit,
// then served from cache and regenerated at most once an hour.
export const revalidate = 3600;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

// Cached per request, so the page and its metadata share one query.
const loadTechnology = cache((slug: string) => getTechnology(createPublicClient(), slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const technology = await loadTechnology((await params).slug);
  if (!technology) return {};
  return pageMetadata({
    ...technologyMeta(technology),
    // The canonical address carries no `?from=`: an Upgrade Path is one reading of this one page.
    path: `/technologies/${technology.slug}`,
    type: "website",
  });
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  const technology = await loadTechnology(slug);
  if (!technology) notFound();
  const releases = await listReleases(createPublicClient(), technology.id);
  const grouped = groupByMajor(releases);
  const list = <ReleaseList slug={technology.slug} grouped={grouped} retired={technology.retired} />;
  // The start the page falls back to when nobody gave one, derived from the Releases alone, so it is
  // part of the cached render: the Visitor who never fills the form still lands on an Upgrade Path.
  const fallback = defaultUpgradeStart(releases);
  // The first row of the Upgrade Panel, composed here for the same reason the Follow is: declaring a
  // Version in use belongs to `plans`, and the Upgrade Path takes it as an element.
  const declaration = <CurrentVersionField technologyId={technology.id} name={technology.name} latest={grouped.latest} />;

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <PageBreadcrumb path={[TECHNOLOGIES_CRUMB, technology.slug]} />
        {/* One scope for the whole page: the Follow in the header and the Upgrade Path below it read
            the same follows, so a declared Version in use can start the path. */}
        <TechnologyScope technologyId={technology.id}>
          <TechnologyHeader
            technology={technology}
            latest={grouped.latest}
            follow={
              <TechnologyFollow technologyId={technology.id} name={technology.name} retired={technology.retired} />
            }
          />
          {grouped.latest ? (
            // `?from` is read on the client; until then the page shows the path it derived itself.
            <Suspense
              fallback={
                <UpgradePathBlock
                  slug={technology.slug}
                  name={technology.name}
                  latest={grouped.latest}
                  retired={technology.retired}
                  releases={releases}
                  start={fallback ? { kind: "default", ...fallback } : { kind: "none" }}
                  declaration={declaration}
                >
                  {list}
                </UpgradePathBlock>
              }
            >
              <UpgradePathView
                slug={technology.slug}
                name={technology.name}
                latest={grouped.latest}
                retired={technology.retired}
                releases={releases}
                fallback={fallback}
                declaration={declaration}
              >
                {list}
              </UpgradePathView>
            </Suspense>
          ) : (
            list
          )}
        </TechnologyScope>
      </main>
    </>
  );
}
