import { Info } from "lucide-react";
import { DiagnosticPage } from "@/components/diagnostic-page";
import { HelpPointer } from "@/components/help-pointer";
import { STATIC_SITE } from "@/lib/static-site";
import { getTranslator } from "@/modules/i18n/server";

// Reached two ways: `notFound()` from a Technology or Release page whose slug or Version is
// unknown, and any URL that matches no route at all. Both are the absence of a thing rather than a
// failure, so the line is a neutral `note:` with no ink (DESIGN.md: don't colour non-error status
// lines), and the copy says so instead of apologising.
export default async function NotFound() {
  const t = await getTranslator();

  return (
    <DiagnosticPage Icon={Info} label="note:" claim={t("page.notFound.claim")}>
      <p className="mt-3 max-w-measure text-text-muted">{t("page.notFound.body")}</p>
      {/* The way out of a page that is not there. On the showcase it is the landing and not the
          Catalog: the Catalog is behind sign-in and is not exported, so the pointer would send a
          reader from one 404 to the next (issue #215). */}
      <p className="mt-6">
        {STATIC_SITE ? (
          <HelpPointer href="/">{t("page.notFound.home")}</HelpPointer>
        ) : (
          <HelpPointer href="/technologies">{t("page.browseCatalog")}</HelpPointer>
        )}
      </p>
    </DiagnosticPage>
  );
}
