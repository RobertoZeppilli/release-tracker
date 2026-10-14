import Link from "next/link";
import { TechnologyMark } from "@/modules/catalog/ui";
import type { StandingRow as Row } from "../domain/standing";
import { barShare, standingWords } from "./dashboard-copy";

// DESIGN.md, Standing Row: one per followed Technology, always, and never more than one. It is a
// link to its Technology page, two lines, and it carries no significance glyph: a row is about a
// Technology, not about one of its Releases.
export function StandingRow({
  row,
  scale,
}: {
  row: Row;
  scale: number | null;
}) {
  const { words, action } = standingWords(row);
  const share = barShare(row, scale);

  return (
    <Link
      href={`/technologies/${row.technology.slug}`}
      className="block border-b border-rule p-3 no-underline last:border-b-0 hover:bg-raised focus-visible:bg-raised"
    >
      <span className="flex items-baseline gap-2">
        {/* DESIGN.md, Technology Mark: the brand's shape in the text's own ink, never its colour,
            and the box is there whether the shape exists or not, so every name in the list starts
            at the same x. */}
        <span className="self-center text-text-muted">
          <TechnologyMark slug={row.technology.slug} />
        </span>
        <span className="text-body leading-[1.45] font-medium tracking-[-0.01em] text-text">
          {row.technology.name}
        </span>
        {row.latest && (
          <span className="ml-auto font-mono text-diagnostic leading-[normal] text-text-muted tabular-nums">
            {row.latest}
          </span>
        )}
      </span>
      {/* The words are the content: the bar beside them is `aria-hidden`, and a row that needs
          action takes the ink, bar included. */}
      <span
        className={`mt-[2px] flex items-center gap-2 font-mono text-label tabular-nums ${action ? "text-action" : "text-text-faint"}`}
      >
        {share !== null && (
          <span
            aria-hidden
            className="h-1 flex-1 overflow-hidden rounded-[2px] bg-sunken"
          >
            <span
              className={`block h-full ${action ? "bg-action" : "bg-rule-strong"}`}
              style={{ width: `${share}%` }}
            />
          </span>
        )}
        {words}
      </span>
    </Link>
  );
}
