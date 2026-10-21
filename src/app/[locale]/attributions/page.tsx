import type { Metadata } from "next";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();

  return pageMetadata({
    title: t("page.attributions.title"),
    description: t("page.attributions.description"),
    path: "/attributions",
    type: "website",
    locale: await currentLocale(),
  });
}

export default async function AttributionsPage() {
  const t = await getTranslator();

  return (
    <DocumentPage
      title={t("page.attributions.title")}
      updated="2026-10-15"
      lede={t("attributions.lede")}
    >
      <DocumentSection title={t("attributions.marks.title")}>
        <p>
          <Filled
            text={t("attributions.marks.body")}
            nodes={{
              simpleIcons: (
                <a href="https://simpleicons.org" className="text-link">
                  simple-icons
                </a>
              ),
            }}
          />
        </p>
        <p>{t("attributions.marks.trademarks")}</p>
      </DocumentSection>

      <DocumentSection title={t("attributions.notes.title")}>
        <p>{t("attributions.notes.body")}</p>
      </DocumentSection>

      <DocumentSection title={t("attributions.type.title")}>
        <p>
          <Filled
            text={t("attributions.type.body")}
            nodes={{
              lucide: (
                <a href="https://lucide.dev" className="text-link">
                  Lucide
                </a>
              ),
            }}
          />
        </p>
      </DocumentSection>

      <DocumentSection title={t("attributions.runs.title")}>
        <p>
          <Filled
            text={t("attributions.runs.body")}
            nodes={{
              privacy: (
                <Link href="/privacy" className="text-link">
                  {t("doc.link.privacy")}
                </Link>
              ),
            }}
          />
        </p>
      </DocumentSection>
    </DocumentPage>
  );
}
