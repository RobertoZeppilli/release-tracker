import { LogIn, TerminalSquare } from "lucide-react";
import type { Metadata } from "next";
import { getTranslator } from "@/modules/i18n/server";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { serverEnv } from "@/env/server";
import { safeRedirectPath } from "@/modules/auth";
import { getDeveloper } from "@/modules/auth/server";
import { SeverityLabel } from "@/modules/releases/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("page.login.title"),
    description: t("page.login.description"),
    robots: { index: false },
  };
}

// What the callback can come back with, as keys: the sentences are in the dictionary, and lower
// case, because the message is the claim after the `error:` label and not a sentence on its own
// (DESIGN.md, The Severity Pairing Rule).
const ERRORS = {
  denied: "account.login.error.denied",
  exchange: "account.login.error.exchange",
  provider: "account.login.error.provider",
  dev: "account.login.error.dev",
} as const;

// A lookup and not a cast: what arrives in `?error=` is whatever was put in the address.
function errorKey(value: string | undefined): (typeof ERRORS)[keyof typeof ERRORS] | undefined {
  const found = Object.entries(ERRORS).find(([reason]) => reason === value);
  return found?.[1];
}

const BUTTON =
  "inline-flex h-[34px] items-center gap-2 rounded-md border px-3 font-sans text-[14px] font-medium hover:bg-raised";

type Props = { searchParams: Promise<{ next?: string; error?: string; deleted?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const t = await getTranslator();
  const { next, error, deleted } = await searchParams;
  const target = safeRedirectPath(next);
  // Already signed in: the login has nothing to ask.
  if (await getDeveloper()) redirect(target);
  const message = errorKey(error);
  // Both set only in local development; in production the route behind this button answers 404.
  const localDeveloper = Boolean(serverEnv.DEV_LOGIN_EMAIL && serverEnv.DEV_LOGIN_PASSWORD);

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">{t("page.login.title")}</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">{t("account.login.intro")}</p>
        {/* Where a deletion lands (`/auth/delete-account`). It is said on this page and not on the
            landing: the landing is prerendered once per deploy and reads no search param, and a
            deletion that ended in silence reads as a button that did nothing. */}
        {deleted ? (
          <p role="status" className="mt-4 max-w-prose font-sans text-body text-text-muted">
            <SeverityLabel tone="muted" label="note:" />{" "}
            <span className="inline-block">{t("account.login.deleted")}</span>
          </p>
        ) : null}
        {message ? (
          <p role="alert" className="mt-4 max-w-measure font-mono text-status text-breaking">
            <SeverityLabel tone="breaking" label="error:" /> <span className="inline-block">{t(message)}</span>
          </p>
        ) : null}
        {/* Before the button and not under it (issue #132): the sentence a sign-in commits to has
            to be readable before the click that commits to it, which is the same rule the note
            about what GitHub is asked for already follows. */}
        <p className="mt-6 max-w-measure font-mono text-meta text-text-faint">
          {/* One sentence with two gaps a link goes in, so a language may put them where its own
              grammar wants them (`Filled`, and `message.ts`). */}
          <Filled
            text={t("account.login.terms")}
            nodes={{
              terms: (
                <Link href="/terms" className="text-link">
                  {t("account.login.terms.link")}
                </Link>
              ),
              privacy: (
                <Link href="/privacy" className="text-link">
                  {t("account.login.privacy.link")}
                </Link>
              ),
            }}
          />
        </p>
        <form action="/auth/sign-in" method="post" className="mt-4">
          <input type="hidden" name="next" value={target} />
          <button type="submit" className={`${BUTTON} border-rule-strong text-text hover:border-text-faint`}>
            <LogIn className="size-4" strokeWidth={2} aria-hidden />
            {t("account.login.button")}
          </button>
        </form>
        <p className="mt-4 max-w-measure font-mono text-meta text-text-faint">
          {t("account.login.scope")}
        </p>
        {localDeveloper && (
          <form action="/auth/dev-sign-in" method="post" className="mt-4">
            <input type="hidden" name="next" value={target} />
            <button type="submit" className={`${BUTTON} border-rule text-text-muted hover:text-text`}>
              <TerminalSquare className="size-4" strokeWidth={2} aria-hidden />
              {t("account.login.dev")}
            </button>
            <span className="mt-2 block font-mono text-meta text-text-faint">
              {t("account.login.devNote")}
            </span>
          </form>
        )}
      </main>
    </>
  );
}
