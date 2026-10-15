import type { Metadata } from "next";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale } from "@/modules/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contact",
    description: "One address, answered by the person who runs Verdict.",
    path: "/contact",
    type: "website",
    locale: await currentLocale(),
  });
}

// One address and no form: a form would need a service to deliver it and a place to keep what it
// collects, and this page would then have to explain both. An address explains itself.
export default function ContactPage() {
  return (
    <DocumentPage
      title="Contact"
      updated="2026-10-15"
      lede={
        <>
          One address, read by the person who runs this. There is no form, no ticket and no bot in
          between, and no promise about how fast an answer comes.
        </>
      }
    >
      <DocumentSection title="write here">
        <p className="font-mono text-diagnostic">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          A summary that misreads its release notes, a release that never appeared, a page that
          breaks at your width, a question the{" "}
          <Link href="/faq" className="text-link">
            FAQ
          </Link>{" "}
          does not answer: all of it is worth writing about. If something is wrong on a page, the
          address of that page is the most useful line of the message.
        </p>
      </DocumentSection>

      <DocumentSection title="two things you do not have to write for">
        <p>
          <strong className="font-semibold text-text">Deleting your account.</strong> It is a button
          on the{" "}
          <Link href="/account" className="text-link">
            account page
          </Link>{" "}
          and it works at once. Nobody has to approve it.
        </p>
        <p>
          <strong className="font-semibold text-text">Adding a technology.</strong> The catalog is
          curated and there is no request queue, so a mail about it is a thing to know and not a
          thing to track. Say it anyway if it matters to you.
        </p>
      </DocumentSection>

      <DocumentSection title="something that should not be public">
        <p>
          A security problem, or anything about another person&rsquo;s data, goes to the same
          address and nowhere public. Say what you found and how to see it happen, and give it time
          to be fixed before telling anyone else.
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
