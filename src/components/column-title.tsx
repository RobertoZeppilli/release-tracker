import type { ReactNode } from "react";

// DESIGN.md, Standing Column, Stream Row, Stack Column and Catalog Column: every column of a split
// page is headed by its own title in Meta, and each names its own ordering or its own window,
// because that is the information: a list sorted by something invisible is a list a reader re-sorts
// by eye. It is not a Section title: it names a question, not a set of rows to be counted.
export function ColumnTitle({
  id,
  className = "mb-3",
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2 id={id} className={`${className} font-mono text-label leading-[normal] text-text-faint`}>
      {children}
    </h2>
  );
}
