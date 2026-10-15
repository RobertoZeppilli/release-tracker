import type { Metadata } from "next";
import Link from "next/link";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { pageMetadata } from "@/lib/metadata";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "What Verdict follows, what an account is for, and how far a generated summary can be trusted.",
  path: "/faq",
  type: "website",
});

// A question is a heading and not a row of a list: a reader scanning this page is looking for their
// own question, and the answer under it is prose. The register is the app's own, so the question
// takes the Title size in the grotesk and the answers sit at the measure, like every other page
// here (DESIGN.md, Typography).
function Question({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-rule pb-4 last:border-0 last:pb-0">
      <h3 className="font-sans text-title font-semibold text-text">{question}</h3>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <DocumentPage
      title="FAQ"
      updated="2026-10-15"
      lede={
        <>
          The questions this product is actually asked, answered by what it does rather than by
          what it would like to do.
        </>
      }
    >
      <DocumentSection title="the product">
        <Question question="What does Verdict do?">
          <p>
            It follows the releases of the technologies in its catalog and gives each release a
            single verdict: whether it asks something of you, what breaks, and how to migrate.
            Every claim points at the line of the release notes it was read from.
          </p>
        </Question>
        <Question question="Can I ask for a technology to be added?">
          <p>
            No. The catalog is curated: a technology enters it when its releases can be followed
            properly, and that is a decision rather than a queue. You can write and say what you
            are missing, but there is no request to file and nothing to track.
          </p>
        </Question>
        <Question question="How soon does a new release appear?">
          <p>
            The job that looks for new releases runs once a day. A release page shows the notes as
            soon as the release is recorded; its verdict appears once the summary has been written,
            which is a separate job and can lag behind.
          </p>
        </Question>
        <Question question="Do I need an account to read a release?">
          <p>
            No. Release and technology pages are public. An account is only for the part that is
            yours: following technologies, declaring the version you are on, and the dashboard
            built from the two.
          </p>
        </Question>
      </DocumentSection>

      <DocumentSection title="the summaries">
        <Question question="Who writes the summaries?">
          <p>
            A language model, from the release notes the project published and from nothing else.
            It is given no other source, no other page and no data about any reader.
          </p>
        </Question>
        <Question question="Can a summary be wrong?">
          <p>
            Yes, and the page is built on the assumption that it can be. That is what the quoted
            line under a claim is for, and why every page links the notes at their source: the
            summary is there to save you the reading, not to be believed on its own. When a change
            is expensive to get wrong, check the cited line.
          </p>
        </Question>
        <Question question="Does anything about me go into a prompt?">
          <p>
            No. The summaries are written by a job on the server, before anyone opens the page, and
            that job knows nothing about accounts. A summary is the same text for every reader. The
            rest of it is in the{" "}
            <Link href="/privacy" className="text-link">
              privacy notice
            </Link>
            .
          </p>
        </Question>
      </DocumentSection>

      <DocumentSection title="the account">
        <Question question="What does the GitHub sign-in ask for?">
          <p>
            Your public profile and your email address. No access to any repository, private or
            public, and nothing is ever written to your GitHub account.
          </p>
        </Question>
        <Question question={`Why ${FREE_FOLLOW_LIMIT} technologies?`}>
          <p>
            Because that is what the Free plan holds, and Free is the only plan there is. It is a
            stack, not a catalog: the limit is what keeps the dashboard a page you can read at a
            glance.
          </p>
        </Question>
        <Question question="How do I delete my account?">
          <p>
            On the{" "}
            <Link href="/account" className="text-link">
              account page
            </Link>
            . You type one word to confirm, and the account goes at once, with the technologies you
            followed and the versions you declared. There is no grace period and nothing to undo it
            with.
          </p>
        </Question>
        <Question question="Is there a cookie banner?">
          <p>
            No, because there is nothing to ask about: no advertising, no profiling, and no third
            party setting anything in your browser. Signing in sets the session cookies that keep
            you signed in, and the theme you pick stays in your own browser.
          </p>
        </Question>
      </DocumentSection>
    </DocumentPage>
  );
}
