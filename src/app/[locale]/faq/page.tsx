import type { Metadata } from "next";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();

  return pageMetadata({
    title: t("page.faq.title"),
    description: t("page.faq.description"),
    path: "/faq",
    type: "website",
    locale: await currentLocale(),
  });
}

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

export default async function FaqPage() {
  const t = await getTranslator();

  return (
    <DocumentPage title={t("page.faq.title")} updated="2026-10-23" lede={t("faq.lede")}>
      <DocumentSection title={t("faq.section.product")}>
        <Question question={t("faq.does.q")}>
          <p>{t("faq.does.a")}</p>
        </Question>
        <Question question={t("faq.add.q")}>
          <p>{t("faq.add.a")}</p>
        </Question>
        <Question question={t("faq.when.q")}>
          <p>{t("faq.when.a")}</p>
        </Question>
        <Question question={t("faq.read.q")}>
          <p>{t("faq.read.a")}</p>
        </Question>
      </DocumentSection>

      <DocumentSection title={t("faq.section.summaries")}>
        <Question question={t("faq.who.q")}>
          <p>{t("faq.who.a")}</p>
        </Question>
        <Question question={t("faq.wrong.q")}>
          <p>{t("faq.wrong.a")}</p>
        </Question>
        <Question question={t("faq.prompt.q")}>
          <p>
            <Filled
              text={t("faq.prompt.a")}
              nodes={{
                privacy: (
                  <Link href="/privacy" className="text-link">
                    {t("doc.link.privacy")}
                  </Link>
                ),
              }}
            />
          </p>
        </Question>
      </DocumentSection>

      {/* The three places ADR 0009 asks the Free/Pro line to be said are the `Pro` mark in
          `/settings`, the line of days left beside it, and these two questions. */}
      <DocumentSection title={t("faq.section.notifications")}>
        <Question question={t("faq.notify.q")}>
          <p>{t("faq.notify.a")}</p>
        </Question>
        <Question question={t("faq.pro.q")}>
          <p>{t("faq.pro.a", { limit: FREE_FOLLOW_LIMIT })}</p>
        </Question>
      </DocumentSection>

      <DocumentSection title={t("faq.section.account")}>
        <Question question={t("faq.scope.q")}>
          <p>{t("faq.scope.a")}</p>
        </Question>
        <Question question={t("faq.limit.q", { limit: FREE_FOLLOW_LIMIT })}>
          <p>{t("faq.limit.a")}</p>
        </Question>
        <Question question={t("faq.delete.q")}>
          <p>
            <Filled
              text={t("faq.delete.a")}
              nodes={{
                account: (
                  <Link href="/account" className="text-link">
                    {t("doc.link.account")}
                  </Link>
                ),
              }}
            />
          </p>
        </Question>
        <Question question={t("faq.cookies.q")}>
          <p>{t("faq.cookies.a")}</p>
        </Question>
      </DocumentSection>
    </DocumentPage>
  );
}
