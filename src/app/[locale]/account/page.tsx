import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/env";
import { createRequestClient } from "@/lib/supabase-request";
import { githubRevokeUrl } from "@/modules/auth";
import { requireAccount } from "@/modules/auth/server";
import { getTranslator } from "@/modules/i18n/server";
import { DeleteAccountPanel, type DeletionError } from "@/modules/auth/ui";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";
import { readFollows, readPlan } from "@/modules/plans/server";

// Behind the login and never indexed, so the whole of its metadata is the title in the page's own
// language (ADR 0008).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("page.account.title"), robots: { index: false } };
}

type Props = { searchParams: Promise<{ error?: string }> };

const ERRORS: DeletionError[] = ["confirm", "failed"];

function readError(value: string | undefined): DeletionError | null {
  return ERRORS.find((error) => error === value) ?? null;
}

// What this account is, and the one page that can end it. It lists what is held by reading it, not
// by describing it: every line below is a row this app really has, so the list cannot drift from
// the database the way a written one would (issue #132).
export default async function AccountPage({ searchParams }: Props) {
  const t = await getTranslator();
  const account = await requireAccount("/account");
  const error = readError((await searchParams).error);
  const db = await createRequestClient();
  const [follows, plan] = await Promise.all([readFollows(db), readPlan(db)]);
  const declared = follows.filter((follow) => follow.currentVersion).length;

  // The Plan is a value (`free` / `pro` / `team`), so it is printed as it is stored.
  const held: [string, string][] = [
    [t("account.held.signedIn"), account.email ?? t("account.held.noEmail")],
    [t("account.held.handle"), account.handle ?? t("account.held.none")],
    [t("account.held.plan"), plan],
    [
      t("account.held.followed"),
      t("account.held.quota", { count: follows.length, limit: FREE_FOLLOW_LIMIT }),
    ],
    [t("account.held.declared"), String(declared)],
  ];

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">{t("page.account.title")}</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">{t("account.intro")}</p>
        <dl className="mt-6 max-w-measure font-mono text-diagnostic">
          {held.map(([label, value]) => (
            <div key={label} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-rule py-2">
              <dt className="w-[17ch] shrink-0 text-text-muted">{label}</dt>
              <dd className="text-text">{value}</dd>
            </div>
          ))}
        </dl>
        <DeleteAccountPanel
          followed={follows.length}
          declared={declared}
          error={error}
          revokeUrl={githubRevokeUrl(env.NEXT_PUBLIC_GITHUB_CLIENT_ID)}
          t={t}
        />
      </main>
    </>
  );
}
