import type { Metadata } from "next";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";
import type { MessageKey } from "@/modules/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();

  return pageMetadata({
    title: t("page.privacy.title"),
    description: t("page.privacy.description"),
    path: "/privacy",
    type: "website",
    locale: await currentLocale(),
  });
}

// The list below is the database, read row by row (issue #132): `auth.users` for the identity,
// `follows` for the technologies and the declared version, `plans` for the plan. Nothing is
// described from memory, and anything added to those tables has to be added here too.
// ⚠️ It is a list of **keys** and not of strings now (issue #131): the label and the reason are two
// messages per row, so a row added here without its two keys is a build error, and a row added
// without its Italian is a failing dictionary test rather than an English line on an Italian page.
// ⚠️ The last three arrived with the Notifications (ADR 0009): `notifications` for what was sent,
// `notification_preferences` for which event reaches which channel, and `notification_settings` for
// the language the external channels are written in. The count is in the prose above the list, so a
// row added here is a word to change there as well.
const HELD = [
  "id",
  "email",
  "github",
  "follows",
  "versions",
  "plan",
  "notifications",
  "channels",
  "sendLocale",
] as const;

export default async function PrivacyPage() {
  const t = await getTranslator();

  return (
    <DocumentPage
      title={t("page.privacy.title")}
      updated="2026-10-23"
      lede={t("privacy.lede")}
      governing
    >
      <DocumentSection title={t("privacy.held.title")}>
        <p>{t("privacy.held.intro")}</p>
        <dl className="mt-1 font-mono text-diagnostic">
          {HELD.map((row) => (
            <div key={row} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-rule py-2">
              <dt className="w-[22ch] shrink-0 text-text-muted">
                {t(`privacy.held.${row}.label` satisfies MessageKey)}
              </dt>
              <dd className="text-text">{t(`privacy.held.${row}.why` satisfies MessageKey)}</dd>
            </div>
          ))}
        </dl>
        <p>
          <Filled
            text={t("privacy.held.yours")}
            nodes={{
              account: (
                <Link href="/account" className="text-link">
                  {t("doc.link.account")}
                </Link>
              ),
            }}
          />
        </p>
      </DocumentSection>

      <DocumentSection title={t("privacy.prompt.title")}>
        <p>{t("privacy.prompt.body")}</p>
        <p>{t("privacy.prompt.images")}</p>
      </DocumentSection>

      <DocumentSection title={t("privacy.who.title")}>
        <p>
          <strong className="font-semibold text-text">GitHub</strong> {t("privacy.who.github")}
        </p>
        <p>
          <strong className="font-semibold text-text">Supabase</strong> {t("privacy.who.supabase")}
        </p>
        <p>
          <strong className="font-semibold text-text">Vercel</strong> {t("privacy.who.vercel")}
        </p>
        <p>
          <strong className="font-semibold text-text">Anthropic</strong> {t("privacy.who.anthropic")}
        </p>
      </DocumentSection>

      <DocumentSection title={t("privacy.cookies.title")}>
        <p>{t("privacy.cookies.body")}</p>
        <p>{t("privacy.cookies.what")}</p>
      </DocumentSection>

      <DocumentSection title={t("privacy.keep.title")}>
        <p>
          <Filled
            text={t("privacy.keep.body")}
            nodes={{
              account: (
                <Link href="/account" className="text-link">
                  {t("doc.link.account")}
                </Link>
              ),
            }}
          />
        </p>
        <p>{t("privacy.keep.notifications")}</p>
        <p>{t("privacy.keep.after")}</p>
      </DocumentSection>

      <DocumentSection title={t("privacy.reach.title")}>
        <p>
          <Filled
            text={t("privacy.reach.body")}
            nodes={{
              mail: (
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
                  {CONTACT_EMAIL}
                </a>
              ),
            }}
          />
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
