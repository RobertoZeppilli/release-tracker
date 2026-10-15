"use client";

import { CircleX } from "lucide-react";
import { DiagnosticPage } from "@/components/diagnostic-page";
import { HelpPointer } from "@/components/help-pointer";

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
  return (
    <DiagnosticPage Icon={CircleX} tone="breaking" label="error:" claim="this page could not be loaded">
      <p className="mt-3 max-w-measure text-text-muted">
        Something on our side failed while rendering this page. Nothing was saved and nothing
        changed, so trying again is safe.
      </p>
      <p className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => retry()} className={BUTTON}>
          Try again
        </button>
        <HelpPointer href="/technologies">browse the catalog</HelpPointer>
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-meta text-text-faint tabular-nums">reference {error.digest}</p>
      ) : null}
    </DiagnosticPage>
  );
}
