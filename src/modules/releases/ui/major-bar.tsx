import type { PathCounts } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { SignificanceGlyph } from "./significance-glyph";
import { barHasAction, type BarLevel, BAR_LEVELS, legendLevels, majorWords } from "./upgrade-path-copy";

// DESIGN.md, Stat Row: the bar is the title of its group, not a list of its own above the list. The
// two counted the same Releases 300px apart and the group title said the count a third time, so the
// row and the title are now one thing. The fills are neutral in significance order, because
// significance is a shape and never a hue (DESIGN.md, The Neutral Significance Rule).
const FILL: Record<BarLevel, string> = {
  featured: "bg-text",
  notable: "bg-text-muted",
  digest: "bg-rule-strong",
};

// The width is this group's share of the largest group, so the bars of one list compare with each
// other. `aria-hidden`: every segment is also counted in the words beside it.
export function MajorBar({ counts, widest }: { counts: PathCounts; widest: number }) {
  return (
    <span aria-hidden className="block">
      <span
        className="flex min-w-7 flex-col gap-[2px]"
        style={{ width: `${(counts.total / widest) * 100}%` }}
      >
        <span className="flex h-2 gap-[2px]">
          {BAR_LEVELS.map((level) =>
            counts[level] > 0 ? (
              <span key={level} className={`block h-full ${FILL[level]}`} style={{ flex: counts[level] }} />
            ) : null,
          )}
        </span>
        {/* The one lane that is a hue: `action` already means action required everywhere else, and
            it cuts across the partition instead of dividing it, so it is a rule under the bar and
            not a fourth segment. Its width is the share of this group, not of the widest. */}
        {counts.actionRequired > 0 && (
          <span
            className="block h-[2px] bg-action"
            style={{ width: `${(counts.actionRequired / counts.total) * 100}%` }}
          />
        )}
      </span>
    </span>
  );
}

// DESIGN.md, Stat Row: the one place shape, fill and word are mapped to each other, so it is read
// out as well as seen. It sits at the head of the column now, before the bars it explains, and it
// lists only the levels the bars actually draw.
export function BarLegend({ counts }: { counts: readonly PathCounts[] }) {
  const levels = legendLevels(counts);
  if (levels.length === 0) return null;

  return (
    <ul
      aria-label="Bar fills"
      className="mb-5 flex list-none flex-wrap gap-4 font-mono text-meta leading-[normal] text-text-faint"
    >
      {levels.map((level) => (
        <li key={level} className="inline-flex items-center gap-[6px]">
          <SignificanceGlyph significance={level} />
          <i aria-hidden className={`inline-block h-2 w-[10px] ${FILL[level]}`} />
          {level}
        </li>
      ))}
      {barHasAction(counts) && (
        <li className="inline-flex items-center gap-[6px]">
          <i aria-hidden className="inline-block h-[2px] w-[10px] bg-action" />
          needs action
        </li>
      )}
    </ul>
  );
}

// The counts in words, which carry the numbers the bar only draws. The dot is the partition and the
// comma is what cuts across it, so a reader is never left adding five numbers into four (DESIGN.md,
// Stat Row). `after` is the start of a path that falls inside this major: the group counts the
// Releases after it, not all of them.
export function MajorWords({ counts, after }: { counts: PathCounts; after?: string }) {
  const words = majorWords(counts);
  return (
    <>
      {words.kinds}
      {after && ` after ${after}`}
      {words.action && (
        <>
          {", "}
          <span className="whitespace-nowrap">
            <SeverityLabel tone="action" label={words.action} />
          </span>
        </>
      )}
      {words.missing && `, ${words.missing}`}
    </>
  );
}
