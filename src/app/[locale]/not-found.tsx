import { Info } from "lucide-react";
import { DiagnosticPage } from "@/components/diagnostic-page";
import { HelpPointer } from "@/components/help-pointer";
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
      <p className="mt-6">
        <HelpPointer href="/technologies">{t("page.browseCatalog")}</HelpPointer>
      </p>
    </DiagnosticPage>
  );
}
