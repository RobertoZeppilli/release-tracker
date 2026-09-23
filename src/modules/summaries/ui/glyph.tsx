import type { LucideIcon } from "lucide-react";

// DESIGN.md: severity is always a glyph plus a label, never colour alone.
export function Glyph({ Icon }: { Icon: LucideIcon }) {
  return <Icon aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />;
}
