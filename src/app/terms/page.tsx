import type { Metadata } from "next";
import Link from "next/link";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description:
    "What Verdict is, what the free plan holds, and why a generated summary always shows the line it was read from.",
  path: "/terms",
  type: "website",
});

// Issue #132: every claim on this page is one the code makes true, and the page says nothing the
// app does not do. The follow limit is imported rather than typed, so the terms cannot promise a
// number the Plan stopped enforcing.
export default function TermsPage() {
  return (
    <DocumentPage
      title="Terms of service"
      updated="2026-10-15"
      lede={
        <>
          What the service is, what it holds you to, and what it does not promise. It is short
          because the product is small, and nothing below describes something the app does not do.
        </>
      }
    >
      <DocumentSection title="the service">
        <p>
          Verdict follows the releases of the technologies in its catalog and gives each one a
          verdict: whether it asks something of you, what breaks, and how to migrate. Release and
          technology pages are public and need no account. Following a technology, declaring the
          version you are on and the dashboard are yours alone, and those need one.
        </p>
      </DocumentSection>

      <DocumentSection title="the catalog is curated">
        <p>
          The catalog is chosen and maintained by us. There is no form to add a technology to it and
          no queue behind one: a technology enters when we can follow its releases properly, and it
          can be retired when we no longer can. A retired technology stays readable, and it stays
          yours if you were following it.
        </p>
      </DocumentSection>

      <DocumentSection title="the plan">
        <p>
          There is one plan, Free. It follows up to {FREE_FOLLOW_LIMIT} technologies and costs
          nothing. The app never asks for payment details, and there is nothing to cancel.
        </p>
      </DocumentSection>

      <DocumentSection title="the summaries are generated, and can be wrong">
        <p>
          Every summary is written by a language model that reads one thing: the release notes the
          project itself published for that release. It is given no other source, and no data about
          you.
        </p>
        <p>
          A model can misread. That is why a summary is not the last word on the page: its claims
          carry the line of the release notes they were read from, and the page links the notes at
          their source. The quote is there so you can check instead of trust. When a change is
          expensive to get wrong, read the cited line before you act on the verdict.
        </p>
      </DocumentSection>

      <DocumentSection title="your account">
        <p>
          You sign in with GitHub, which is asked for your public profile and your email address and
          nothing else: no access to any repository. You can delete the account at any time from the{" "}
          <Link href="/account" className="text-link">
            account page
          </Link>
          , and deleting it takes the technologies you follow and the versions you declared with it.
          What is held, and by whom, is in the{" "}
          <Link href="/privacy" className="text-link">
            privacy notice
          </Link>
          .
        </p>
      </DocumentSection>

      <DocumentSection title="what we ask of you">
        <p>
          Read it, follow what you use, and leave the rest alone: no automated traffic beyond what a
          reader generates, no attempt to reach another account&rsquo;s data, no attempt to break
          the app or the services behind it. An account doing any of those can be ended without
          notice.
        </p>
      </DocumentSection>

      <DocumentSection title="no warranty">
        <p>
          The service is provided as it is. It can change, it can be unavailable, and it can stop.
          The summaries can be wrong, the release notes they read can themselves be wrong or
          incomplete, and an upgrade is still your decision and your responsibility. Nothing here is
          advice, and no liability is accepted for what follows from an upgrade.
        </p>
      </DocumentSection>

      <DocumentSection title="changes, and how to reach us">
        <p>
          These terms can change. The date at the top of this page is the day its text last changed,
          and it is the only record of that there is. Questions, mistakes you spot, anything else:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
