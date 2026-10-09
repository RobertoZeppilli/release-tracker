import type { ReactNode } from "react";

// DESIGN.md, Layout (Landing): the landing is a stack of bands. One opens with a 1px rule that runs
// the full width of the container, carries its number in the margin at the title's own scale, and
// keeps the same 8ch indent for everything under it, so the whole page reads off one vertical line.
// The number is decorative: it is the page's rhythm, no sentence refers to a band by it, and at Meta
// size it read as a footnote to the margin instead.
const INDENT = "pl-[calc(8ch+16px)] max-sm:pl-[0px]";

export function Band({
  id,
  number,
  title,
  sub,
  children,
}: {
  id: string;
  number: string;
  title: string;
  sub: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} data-arrival="" className="border-t border-rule py-8 max-sm:py-7">
      <div className="mb-6 grid grid-cols-[8ch_1fr] items-baseline gap-4 max-sm:grid-cols-1 max-sm:gap-2">
        <span aria-hidden className="font-mono text-band text-text-faint">
          {number}
        </span>
        <h2 id={id} className="font-mono text-band">
          {title}
        </h2>
        <p className="col-start-2 mt-2 max-w-[64ch] font-sans text-body text-text-muted max-sm:col-start-1 max-sm:mt-[0px]">
          {sub}
        </p>
      </div>
      <div className={INDENT}>{children}</div>
    </section>
  );
}
