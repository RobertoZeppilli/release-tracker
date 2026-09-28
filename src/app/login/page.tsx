import { LogIn, TerminalSquare } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { serverEnv } from "@/env/server";
import { safeRedirectPath } from "@/modules/auth";
import { getDeveloper } from "@/modules/auth/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with GitHub to follow technologies and see your dashboard.",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  denied: "The sign in was cancelled. Nothing changed.",
  exchange: "That sign in link is no longer valid. Try again.",
  provider: "GitHub is unreachable right now. Try again in a moment.",
  dev: "The local developer could not sign in. Run `pnpm dev:login` and try again.",
};

const BUTTON =
  "inline-flex h-[34px] items-center gap-2 rounded-md border px-3 font-sans text-[14px] font-medium hover:bg-raised";

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const target = safeRedirectPath(next);
  // Already signed in: the login has nothing to ask.
  if (await getDeveloper()) redirect(target);
  const message = error ? ERRORS[error] : undefined;
  // Both set only in local development; in production the route behind this button answers 404.
  const localDeveloper = Boolean(serverEnv.DEV_LOGIN_EMAIL && serverEnv.DEV_LOGIN_PASSWORD);

  return (
    <>
      <SiteHeader path={["sign in"]} />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">Sign in</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">
          Following technologies and the dashboard are yours alone, so they need an account. Release
          and technology pages stay public and need no sign in.
        </p>
        {message ? (
          <p role="alert" className="mt-4 font-mono text-status text-breaking">
            {message}
          </p>
        ) : null}
        <form action="/auth/sign-in" method="post" className="mt-6">
          <input type="hidden" name="next" value={target} />
          <button type="submit" className={`${BUTTON} border-rule-strong text-text hover:border-text-faint`}>
            <LogIn className="size-4" strokeWidth={2} aria-hidden />
            Continue with GitHub
          </button>
        </form>
        <p className="mt-4 font-mono text-meta text-text-faint">
          Asks GitHub only for your public profile and email address. No access to any repository.
        </p>
        {localDeveloper && (
          <form action="/auth/dev-sign-in" method="post" className="mt-4">
            <input type="hidden" name="next" value={target} />
            <button type="submit" className={`${BUTTON} border-rule text-text-muted hover:text-text`}>
              <TerminalSquare className="size-4" strokeWidth={2} aria-hidden />
              Continue as local developer
            </button>
            <span className="mt-2 block font-mono text-meta text-text-faint">
              Local development only: this way in does not exist in production.
            </span>
          </form>
        )}
      </main>
    </>
  );
}
