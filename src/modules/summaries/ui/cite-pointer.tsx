"use client";

import type { Citation } from "../domain/citations";
import { type CiteSeverity, useCitation } from "./citation-context";

function range(citation: Citation): string {
  return citation.fromLine === citation.toLine ? `${citation.fromLine}` : `${citation.fromLine}-${citation.toLine}`;
}

// `release-notes:12-13`: follows to the cited line in the notes below. The href keeps it a real link,
// so a copied address opens the notes on that line; the handler adds the highlight and the focus.
export function CitePointer({ citation, severity, className = "" }: { citation: Citation; severity: CiteSeverity; className?: string }) {
  const store = useCitation();
  const anchor = `#L${citation.fromLine}`;
  return (
    <a
      href={anchor}
      data-cite={range(citation)}
      data-sev={severity}
      onClick={(event) => {
        if (!store) return;
        event.preventDefault();
        store.show(citation, severity);
        window.history.replaceState(null, "", anchor);
      }}
      className={`border-b border-dashed border-current font-mono text-label whitespace-nowrap text-help no-underline hover:border-solid ${className}`}
    >
      release-notes:{range(citation)}
    </a>
  );
}
