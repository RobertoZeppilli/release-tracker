import type { Metadata } from "next";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale } from "@/modules/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Privacy",
    description:
      "Everything Verdict holds about a developer, who touches it, and why no personal data ever enters a prompt.",
    path: "/privacy",
    type: "website",
    locale: await currentLocale(),
  });
}

// The list below is the database, read row by row (issue #132): `auth.users` for the identity,
// `follows` for the technologies and the declared version, `plans` for the plan. Nothing is
// described from memory, and anything added to those tables has to be added here too.
const HELD: [string, string][] = [
  ["account id", "the identifier the sign-in creates, which every row below is keyed by"],
  ["email address", "from GitHub, so the account can be recognised and reached"],
  ["github name and picture", "from GitHub, shown in the top bar and nowhere else"],
  ["technologies followed", "which ones, and the day each was followed"],
  ["versions declared", "the version you say you are on, and the day you said it"],
  ["plan", "Free, for every account"],
];

export default function PrivacyPage() {
  return (
    <DocumentPage
      title="Privacy"
      updated="2026-10-15"
      lede={
        <>
          The whole of what this product knows about you, written from the tables it is kept in. It
          is a short list, and the shortest part of it is the one that matters most: nothing about
          you is ever sent to a language model.
        </>
      }
    >
      <DocumentSection title="what is held">
        <p>
          Six things, and they all arrive either from the GitHub sign-in or from something you did
          in the app. There is no profile to fill in, no name beyond the one GitHub publishes, and
          no field that asks you anything else.
        </p>
        <dl className="mt-1 font-mono text-diagnostic">
          {HELD.map(([label, why]) => (
            <div key={label} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-rule py-2">
              <dt className="w-[22ch] shrink-0 text-text-muted">{label}</dt>
              <dd className="text-text">{why}</dd>
            </div>
          ))}
        </dl>
        <p>
          You can read your own copy of that list, filled in with your rows, on the{" "}
          <Link href="/account" className="text-link">
            account page
          </Link>
          .
        </p>
      </DocumentSection>

      <DocumentSection title="no personal data enters a prompt">
        <p>
          The summaries are written by a language model, and the model is never told who you are.
          The job that writes them runs on the server, on a schedule of its own, and reads one
          thing: the release notes a project published. It does not know which technologies anyone
          follows, and a summary is the same text for every reader, written once and stored.
        </p>
        <p>
          The browser never talks to a third party either. The GitHub picture is served through our
          own image optimizer, so your browser asks this site for it rather than asking GitHub.
        </p>
      </DocumentSection>

      <DocumentSection title="who else touches it">
        <p>
          <strong className="font-semibold text-text">GitHub</strong> authenticates the sign-in and
          hands over your public profile and email address. It has no access to this app&rsquo;s
          data, and this app has no access to your repositories.
        </p>
        <p>
          <strong className="font-semibold text-text">Supabase</strong> runs the database and the
          sessions: the six rows above live there.
        </p>
        <p>
          <strong className="font-semibold text-text">Vercel</strong> hosts the app, so it serves
          every request and keeps the request logs that come with doing so, and it counts page
          views through Vercel Analytics.
        </p>
        <p>
          <strong className="font-semibold text-text">Anthropic</strong> provides the model that
          writes the summaries, from public release notes alone, as above.
        </p>
      </DocumentSection>

      <DocumentSection title="cookies, and what is in your browser">
        <p>
          There is no consent banner on this site because there is nothing to consent to: no
          advertising, no profiling, and no third party setting anything in your browser.
        </p>
        <p>
          Signing in sets session cookies, which are what keeps you signed in from one page to the
          next; signing out or deleting the account clears them. The theme you pick is kept in your
          browser&rsquo;s local storage, not in a cookie, and never leaves the browser. Vercel
          Analytics counts page views without a cookie and without storing an identifier in your
          browser: what it produces is counts of pages, not a trail of a person.
        </p>
      </DocumentSection>

      <DocumentSection title="how long, and how to end it">
        <p>
          Everything above is kept while the account exists. Deleting the account on the{" "}
          <Link href="/account" className="text-link">
            account page
          </Link>{" "}
          removes it at once: the account row goes, and the follows, the declared versions and the
          plan go with it, because they are keyed to it and deleted with it. There is no grace
          period, no archive of ours, and nothing to undo it with.
        </p>
        <p>
          What stays after that is outside the account: the catalog, the releases and the summaries,
          none of which were ever yours or about you. The providers above run their own backups and
          logs on their own schedules, which we neither control nor can delete from.
        </p>
      </DocumentSection>

      <DocumentSection title="how to reach us">
        <p>
          One address, answered by the person who runs this:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>
          . Ask what is held about you, ask for it to be deleted, or tell us something here is
          wrong.
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
