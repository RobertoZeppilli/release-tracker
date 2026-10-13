import type { ReactNode } from "react";

// DESIGN.md, Standing Column and Stream Row: each column of the Dashboard is headed by its own
// title in Meta, and each names its own ordering or its own window, because that is the
// information: a list sorted by something invisible is a list a reader re-sorts by eye.
// The Dashboard has no section titles, and this is not one: it names a question, not a Significance.
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
    <h2 id={id} className={`${className} font-mono text-label text-text-faint`}>
      {children}
    </h2>
  );
}
