"use client";

import { CircleX } from "lucide-react";
import { DiagnosticPage } from "@/components/diagnostic-page";
import { HelpPointer } from "@/components/help-pointer";
import { useTranslator } from "@/modules/i18n/ui";

const BUTTON =
  "inline-flex h-[34px] cursor-pointer items-center rounded-md border border-rule-strong bg-transparent px-3 font-sans text-[14px] font-medium text-text hover:border-text-faint hover:bg-raised";

// An error thrown on the server reaches this boundary as a generic message plus a digest, never the
// original text, so there is nothing internal to leak even by accident. The digest is the one
// detail worth printing: it is what matches this failure to its line in the server log.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // The boundary is a client component, so it reads the language from the context the root layout
  // wrote and never from `i18n/server` (the build names this file when that rule is broken).
  const t = useTranslator();

  return (
    <DiagnosticPage Icon={CircleX} tone="breaking" label="error:" claim={t("page.error.claim")}>
      <p className="mt-3 max-w-measure text-text-muted">{t("page.error.body")}</p>
      <p className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => retry()} className={BUTTON}>
          {t("page.error.retry")}
        </button>
        <HelpPointer href="/technologies">{t("page.browseCatalog")}</HelpPointer>
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-meta text-text-faint tabular-nums">
          {t("page.error.reference", { digest: error.digest })}
        </p>
      ) : null}
    </DiagnosticPage>
  );
}
