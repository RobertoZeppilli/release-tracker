import type { ReactNode } from "react";

// DESIGN.md: a section title is a monospace label with the rule running to the edge.
export function SectionTitle({ id, title, aside }: { id: string; title: string; aside?: ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-3 flex flex-wrap items-baseline gap-3 font-mono text-section-title font-semibold tracking-[0.02em] text-text-muted after:h-px after:flex-1 after:-translate-y-1 after:bg-rule after:content-['']"
    >
      <span className="text-body text-text">{title}</span>
      {aside}
    </h2>
  );
}
