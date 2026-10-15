import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

// The five pages that say what the product is (terms, privacy, attributions, faq, contact) share
// one shape, so they share one component: the same container the rest of the app uses, the
// breadcrumb that says where the page sits, the heading, a lede, and the day the text last changed.
// None of them is a document from another site pasted into this one (DESIGN.md): they are set in
// the app's own register, mono for the structure and the grotesk for the prose.
// The date is written by hand, per page, and that is on purpose: it has to say when the **text**
// changed, which no build date and no file timestamp can tell.
export function DocumentPage({
  title,
  lede,
  updated,
  children,
}: {
  title: string;
  lede: ReactNode;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">{title}</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">{lede}</p>
        <p className="mt-3 font-mono text-meta text-text-faint">last updated: {updated}</p>
        {children}
      </main>
    </>
  );
}

// A section of one of those pages: the monospace label with the hairline running to the edge of
// the measure, the same title the Release page gives a section, and the prose under it at 72ch.
export function DocumentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7 max-w-measure">
      <h2 className="mb-3 flex items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']">
        <span className="text-body text-text">{title}</span>
      </h2>
      <div className="flex flex-col gap-3 font-sans text-body text-text-muted">{children}</div>
    </section>
  );
}
