import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { PageBreadcrumb, TECHNOLOGIES_CRUMB } from "@/components/breadcrumb";
import { ColumnTitle } from "@/components/column-title";
import { SiteHeader } from "@/components/site-header";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale } from "@/modules/i18n/server";
import { createPublicClient } from "@/lib/supabase";
import { technologyMeta } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import { TechnologyHeader } from "@/modules/catalog/ui";
import { CurrentVersionField, TechnologyFollow, TechnologyScope } from "@/modules/plans/ui";
import { defaultUpgradeStart, groupByMajor, recordedHistory } from "@/modules/releases";
import { listReleases } from "@/modules/releases/server";
import { ReleaseList, UpgradePathBlock, UpgradePathView } from "@/modules/releases/ui";

// ISR: no page is built ahead (the build has no database); each is rendered on its first visit,
// then served from cache and regenerated at most once an hour.
export const revalidate = 3600;

// The split: two columns at 1240px, *what do I have to do about this Technology* at 360px on the
// left and *what has changed in it* on the right (DESIGN.md, Technology, the split). The 1041px step
// and not 1240: DESIGN.md says "at 1040px and below" the two columns become one, so the split starts
// one pixel above it. The header is inside the left column and not in a band over the split, so the
// two columns start 100px under the bar instead of 650px under it.
const SPLIT =
  "grid max-w-content items-start gap-7 split:grid-cols-[minmax(0,360px)_minmax(0,1fr)] split:gap-8";

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
    locale: await currentLocale(),
  });
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  const technology = await loadTechnology(slug);
  if (!technology) notFound();
  const releases = await listReleases(createPublicClient(), technology.id);
  const grouped = groupByMajor(releases);
  // The majors of the whole history, already counted: every group title is a stat row now, so the
  // plain list needs the counts the Upgrade Path has always produced (DESIGN.md, Stat Row).
  const history = recordedHistory(releases);
  const list = (
    <ReleaseList
      slug={technology.slug}
      majors={history.majors}
      previews={grouped.previews}
      latest={grouped.latest}
      retired={technology.retired}
    />
  );
  // The start the page falls back to when nobody gave one, derived from the Releases alone, so it is
  // part of the cached render: the Visitor who never fills the form still lands on an Upgrade Path.
  const fallback = defaultUpgradeStart(releases);
  // The first row of the Upgrade Panel, composed here for the same reason the Follow is: declaring a
  // Version in use belongs to `plans`, and the Upgrade Path takes it as an element.
  const declaration = (
    <CurrentVersionField technologyId={technology.id} name={technology.name} latest={grouped.latest} />
  );
  // The head of the left column: where the page sits, whose page it is, and the one action the
  // header carries. It belongs with the panel and the verdict under it, because the right column
  // names its own ordering and so nothing up here was ever shared between the two.
  const head = (
    <div>
      <PageBreadcrumb path={[TECHNOLOGIES_CRUMB, technology.slug]} />
      <TechnologyHeader
        technology={technology}
        latest={grouped.latest}
        follow={
          <TechnologyFollow technologyId={technology.id} name={technology.name} retired={technology.retired} />
        }
      />
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main id="content" className={`mx-auto px-4 pt-5 pb-8 sm:px-5 sm:pt-6 ${SPLIT}`}>
        {/* One scope for the whole page: the Follow in the header and the Upgrade Path below it read
            the same follows, so a declared Version in use can start the path. It renders providers
            and no element of its own, so the two columns stay the grid items of the split. */}
        <TechnologyScope technologyId={technology.id}>
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
                  head={head}
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
                head={head}
                declaration={declaration}
              >
                {list}
              </UpgradePathView>
            </Suspense>
          ) : (
            // No stable Release, so there is no path and no panel: the left column is the header
            // alone and the right one is what has been recorded.
            <>
              <div className="self-stretch">
                <div className="split:sticky split:top-[72px]">{head}</div>
              </div>
              <section aria-labelledby="stream-title">
                <ColumnTitle id="stream-title">what has changed, newest major first</ColumnTitle>
                {list}
              </section>
            </>
          )}
        </TechnologyScope>
      </main>
    </>
  );
}
