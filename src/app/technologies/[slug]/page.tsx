import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { TechnologyHeader } from "@/modules/catalog";
import { createPublicClient } from "@/lib/supabase";
import { getTechnology } from "@/modules/catalog/server";

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

  return (
    <>
      <SiteHeader path={["technologies", technology.slug]} />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <TechnologyHeader technology={technology} />
      </main>
    </>
  );
}
