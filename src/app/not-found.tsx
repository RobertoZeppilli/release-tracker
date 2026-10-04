import { Info } from "lucide-react";
import { DiagnosticPage } from "@/components/diagnostic-page";
import { HelpPointer } from "@/components/help-pointer";

// Reached two ways: `notFound()` from a Technology or Release page whose slug or Version is
// unknown, and any URL that matches no route at all. Both are the absence of a thing rather than a
// failure, so the line is a neutral `note:` with no ink (DESIGN.md: don't colour non-error status
// lines), and the copy says so instead of apologising.
export default function NotFound() {
  return (
    <DiagnosticPage Icon={Info} label="note:" claim="no page at this address">
      <p className="mt-3 max-w-measure text-text-muted">
        Nothing went wrong. This address names no technology in the catalog, or a version with no
        release of its own: the catalog is curated, and a release gets a page once it is detected.
      </p>
      <p className="mt-6">
        <HelpPointer href="/technologies">browse the catalog</HelpPointer>
      </p>
    </DiagnosticPage>
  );
}
