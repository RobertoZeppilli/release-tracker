import type { Metadata } from "next";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale } from "@/modules/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Attributions",
    description:
      "Where the technology marks, the release notes, the typefaces and the icons in Verdict come from, and under which licence.",
    path: "/attributions",
    type: "website",
    locale: await currentLocale(),
  });
}

export default function AttributionsPage() {
  return (
    <DocumentPage
      title="Attributions"
      updated="2026-10-15"
      lede={
        <>
          Most of what you see here was made by someone else. This page says who, and under which
          licence, in one place instead of in a footnote on each page.
        </>
      }
    >
      <DocumentSection title="the technology marks">
        <p>
          The small monochrome mark beside a technology comes from{" "}
          <a href="https://simpleicons.org" className="text-link">
            simple-icons
          </a>
          , released under CC0 1.0. The paths are copied into this repository and served from this
          site, so no page of this app calls a CDN for them.
        </p>
        <p>
          The marks themselves remain the trademarks of their owners. They are used here to name
          the technology a row is about, in shape and never in colour, and they imply no
          endorsement of this product and no relationship with it. A technology whose mark is not
          in simple-icons simply has none here.
        </p>
      </DocumentSection>

      <DocumentSection title="the release notes">
        <p>
          Every release page is built on the notes the project itself published, and those notes
          belong to that project and are used under its own terms. A quoted line is quoted so it
          can be checked, and each page links the notes at their source. A summary is our reading
          of them, not the project&rsquo;s words, and never speaks for the project.
        </p>
      </DocumentSection>

      <DocumentSection title="the typefaces and the icons">
        <p>
          The monospace voice is Fragment Mono and the prose is Hanken Grotesk, both published on
          Google Fonts under the SIL Open Font License, and both served from this site rather than
          from Google. The interface icons are{" "}
          <a href="https://lucide.dev" className="text-link">
            Lucide
          </a>
          , under the ISC licence.
        </p>
      </DocumentSection>

      <DocumentSection title="what it runs on">
        <p>
          Next.js and React for the app, Supabase for the database and the sign-in, Vercel for the
          hosting, Anthropic for the model that writes the summaries, and a long list of open source
          packages under each one. Which of them touch anything of yours is in the{" "}
          <Link href="/privacy" className="text-link">
            privacy notice
          </Link>
          .
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
