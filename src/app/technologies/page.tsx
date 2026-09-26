import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { requireDeveloper } from "@/modules/auth/server";

export const metadata: Metadata = { title: "Technologies", robots: { index: false } };

// Placeholder until issue #17 builds the picker; the protection is what #16 delivers.
export default async function TechnologiesPage() {
  await requireDeveloper("/technologies");

  return (
    <>
      <SiteHeader nav="technologies" />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">Technologies</h1>
      </main>
    </>
  );
}
