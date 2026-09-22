import { CircleCheck, CircleX, Clock, Info, type LucideIcon, TriangleAlert } from "lucide-react";
import type { Tone } from "./upgrade-path-copy";

const TONES: Record<Tone, { Icon: LucideIcon; className: string }> = {
  action: { Icon: TriangleAlert, className: "text-action" },
  ok: { Icon: CircleCheck, className: "text-ok" },
  muted: { Icon: Info, className: "text-text-muted" },
  breaking: { Icon: CircleX, className: "text-breaking" },
};

// DESIGN.md: severity is always a glyph plus a label, never colour alone.
export function SeverityLabel({ tone, label, pending = false }: { tone: Tone; label: string; pending?: boolean }) {
  const { Icon, className } = TONES[tone];
  const Glyph = pending ? Clock : Icon;
  return (
    <span className={className}>
      <Glyph aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
      {label}
    </span>
  );
}
