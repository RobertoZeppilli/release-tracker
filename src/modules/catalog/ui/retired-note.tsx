import { Info } from "lucide-react";
import type { Translator } from "@/modules/i18n";

// A retired Technology keeps its pages online (ADR 0005); this note says why nothing new appears.
// `note:` is not translated: it is the product's own grammar, the same prefix the Summaries carry
// (ADR 0008).
// ⚠️ `t` is a prop and is not read from `i18n/server` here: this file is exported from the module's
// `ui` index, and a server-only import behind that index is one every client component importing the
// index inherits (`OriginalLanguageNote` carries the same warning).
export function RetiredNote({ name, latest, t }: { name: string; latest: string | null; t: Translator }) {
  return (
    <div role="note" className="mt-5 border-y border-rule py-3">
      <p className="text-text-muted">
        <span className="font-mono text-diagnostic">
          <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
          note:
        </span>{" "}
        {latest
          ? t("catalog.retired.withLatest", { name, latest })
          : t("catalog.retired.noLatest", { name })}
      </p>
    </div>
  );
}
