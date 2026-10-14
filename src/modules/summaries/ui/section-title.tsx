// DESIGN.md, Section Title: a monospace label with the hairline rule running out to the right edge
// of the column, and an optional faint aside after it. On this page the title carries no count: the
// Counts Panel under the verdict says the numbers once, and one number printed three times was the
// thing that fixed (DESIGN.md, Counts Panel).
export function SectionTitle({ id, title, aside }: { id: string; title: string; aside?: string }) {
  return (
    <h2
      id={id}
      className="mt-7 mb-4 flex items-baseline gap-3 font-mono text-section-title font-semibold text-text-muted phone:flex-wrap phone:gap-y-1"
    >
      {title}
      {/* A span rather than a pseudo-element, because on a phone the rule goes and the aside takes a
          line of its own: in a 342px column the title wrapped and the rule between the two lines
          collapsed. */}
      <span aria-hidden className="h-px flex-1 -translate-y-1 bg-rule phone:hidden" />
      {aside && <span className="font-normal text-text-faint phone:basis-full">{aside}</span>}
    </h2>
  );
}
