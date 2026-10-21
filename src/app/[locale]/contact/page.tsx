import type { Metadata } from "next";
import { Filled, LocaleLink as Link } from "@/modules/i18n/ui";
import { DocumentPage, DocumentSection } from "@/components/document-page";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import { currentLocale, getTranslator } from "@/modules/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();

  return pageMetadata({
    title: t("page.contact.title"),
    description: t("page.contact.description"),
    path: "/contact",
    type: "website",
    locale: await currentLocale(),
  });
}

// One address and no form: a form would need a service to deliver it and a place to keep what it
// collects, and this page would then have to explain both. An address explains itself.
export default async function ContactPage() {
  const t = await getTranslator();

  return (
    <DocumentPage title={t("page.contact.title")} updated="2026-10-15" lede={t("contact.lede")}>
      <DocumentSection title={t("contact.write.title")}>
        <p className="font-mono text-diagnostic">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          <Filled
            text={t("contact.write.body")}
            nodes={{
              faq: (
                <Link href="/faq" className="text-link">
                  {t("doc.link.faq")}
                </Link>
              ),
            }}
          />
        </p>
      </DocumentSection>

      <DocumentSection title={t("contact.noNeed.title")}>
        <p>
          <strong className="font-semibold text-text">{t("contact.noNeed.delete.lead")}</strong>{" "}
          <Filled
            text={t("contact.noNeed.delete.body")}
            nodes={{
              account: (
                <Link href="/account" className="text-link">
                  {t("doc.link.account")}
                </Link>
              ),
            }}
          />
        </p>
        <p>
          <strong className="font-semibold text-text">{t("contact.noNeed.add.lead")}</strong>{" "}
          {t("contact.noNeed.add.body")}
        </p>
      </DocumentSection>

      <DocumentSection title={t("contact.security.title")}>
        <p>{t("contact.security.body")}</p>
      </DocumentSection>
    </DocumentPage>
  );
}
