"use client";

import { CircleX, Info } from "lucide-react";

export type RowStatusTone = "note" | "error";

// The one geometry for whatever a row has to say about itself (DESIGN.md, "Row Status Line"): an
// `error`, which is what the database refused, and a `note`, which is what the page knows and the
// row cannot show by sitting where it sits. Diagnostic in both, so the line lifts off the 13px facts
// of the row above it, and only the error is inked: a note is not a failure.
export function RowStatusLine({
  id,
  tone,
  className,
  children,
}: {
  id?: string;
  tone: RowStatusTone;
  className: string;
  children: React.ReactNode;
}) {
  const Glyph = tone === "error" ? CircleX : Info;

  return (
    <p id={id} className={`font-mono text-diagnostic ${tone === "error" ? "text-breaking" : "text-text-muted"} ${className}`}>
      <Glyph aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      {tone}: {children}
    </p>
  );
}
