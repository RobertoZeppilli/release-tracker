import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/env";
import { createRequestClient } from "@/lib/supabase-request";
import { githubRevokeUrl } from "@/modules/auth";
import { requireAccount } from "@/modules/auth/server";
import { DeleteAccountPanel, type DeletionError } from "@/modules/auth/ui";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";
import { readFollows, readPlan } from "@/modules/plans/server";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string }> };

const ERRORS: DeletionError[] = ["confirm", "failed"];

function readError(value: string | undefined): DeletionError | null {
  return ERRORS.find((error) => error === value) ?? null;
}

// What this account is, and the one page that can end it. It lists what is held by reading it, not
// by describing it: every line below is a row this app really has, so the list cannot drift from
// the database the way a written one would (issue #132).
export default async function AccountPage({ searchParams }: Props) {
  const account = await requireAccount("/account");
  const error = readError((await searchParams).error);
  const db = await createRequestClient();
  const [follows, plan] = await Promise.all([readFollows(db), readPlan(db)]);
  const declared = follows.filter((follow) => follow.currentVersion).length;

  const held: [string, string][] = [
    ["signed in as", account.email ?? "no email address"],
    ["github name", account.handle ?? "none"],
    ["plan", plan],
    ["followed", `${follows.length} of ${FREE_FOLLOW_LIMIT}`],
    ["versions declared", String(declared)],
  ];

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">Account</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">
          Everything this account is made of, and the way out of it. Nothing here is shared with
          anyone, and nothing on the public release and technology pages depends on it.
        </p>
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
        />
      </main>
    </>
  );
}
