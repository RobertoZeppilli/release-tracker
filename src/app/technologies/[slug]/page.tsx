import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { createPublicClient } from "@/lib/supabase";
import { getTechnology } from "@/modules/catalog/server";
import { TechnologyHeader } from "@/modules/catalog/ui";
import { TechnologyFollow, TechnologyScope } from "@/modules/plans/ui";
import { groupByMajor } from "@/modules/releases";
import { listReleases } from "@/modules/releases/server";
import { ReleaseList, UpgradeForm, UpgradePathView } from "@/modules/releases/ui";

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
  return technology ? { title: `${technology.name} releases`, description: technology.description } : {};
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  const technology = await loadTechnology(slug);
  if (!technology) notFound();
  const releases = await listReleases(createPublicClient(), technology.id);
  const grouped = groupByMajor(releases);
  const list = <ReleaseList slug={technology.slug} grouped={grouped} retired={technology.retired} />;
  const base = `/technologies/${technology.slug}`;

  return (
    <>
      <SiteHeader path={["technologies", technology.slug]} />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        {/* One scope for the whole page: the Follow in the header and the Upgrade Path below it read
            the same follows, so a declared Version in use can start the path. */}
        <TechnologyScope technologyId={technology.id}>
          <TechnologyHeader
            technology={technology}
            latest={grouped.latest}
            follow={
              <TechnologyFollow
                technologyId={technology.id}
                name={technology.name}
                retired={technology.retired}
                latest={grouped.latest}
              />
            }
          />
          {grouped.latest ? (
            // `?from` is read on the client; until then the page shows the form and the plain list.
            <Suspense
              fallback={
                <>
                  <UpgradeForm action={base} latest={grouped.latest} versions={[]} value="" message={null} />
                  {list}
                </>
              }
            >
              <UpgradePathView
                slug={technology.slug}
                name={technology.name}
                latest={grouped.latest}
                retired={technology.retired}
                releases={releases}
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
