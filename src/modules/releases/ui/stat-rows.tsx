import type { PathCounts, PathMajor } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { SignificanceGlyph } from "./significance-glyph";
import { barHasAction, type BarLevel, BAR_LEVELS, legendLevels, majorWords } from "./upgrade-path-copy";

// DESIGN.md, Stat Row. Shared by the Upgrade Path verdict and by the whole recorded history, which
// reads the same bars without a verdict above them: one geometry, so the two never drift apart.
const FILL: Record<BarLevel, string> = {
  featured: "bg-text",
  notable: "bg-text-muted",
  digest: "bg-rule-strong",
};

const WITH_BAR = "grid-cols-[3ch_1ch_minmax(120px,1fr)_auto] max-[640px]:grid-cols-[3ch_1fr]";
const WORDS_ONLY = "grid-cols-[3ch_1fr]";

function StatRow({ major, counts, widest, bars }: { major: number; counts: PathCounts; widest: number; bars: boolean }) {
  const words = majorWords(counts);
  return (
    <li className="col-span-full grid grid-cols-subgrid items-center border-b border-rule py-2">
      <span className="text-text">v{major}</span>
      {bars && (
        <>
          <span aria-hidden className="text-text-faint max-[640px]:hidden">
            |
          </span>
          <span aria-hidden className="block max-[640px]:hidden">
            <span className="flex min-w-7 flex-col gap-[2px]" style={{ width: `${(counts.total / widest) * 100}%` }}>
              <span className="flex h-2 gap-[2px]">
                {BAR_LEVELS.map((level) =>
                  counts[level] > 0 ? <span key={level} className={`block h-full ${FILL[level]}`} style={{ flex: counts[level] }} /> : null,
                )}
              </span>
              {/* The one lane that is a hue: `action` already means action required everywhere else,
                  and it cuts across the partition instead of dividing it, so it is a rule under the
                  bar and not a fourth segment. Its width is the share of this group, not of the
                  widest. */}
              {counts.actionRequired > 0 && (
                <span className="block h-[2px] bg-action" style={{ width: `${(counts.actionRequired / counts.total) * 100}%` }} />
              )}
            </span>
          </span>
        </>
      )}
      {/* The partition is joined by dots and adds up to the count the row opens with. A comma marks
          the counts that cut across it, so the reader is not left adding five numbers into four. */}
      <span className="text-text-muted">
        {words.kinds}
        {words.action && (
          <>
            {", "}
            <SeverityLabel tone="action" label={words.action} />
          </>
        )}
        {words.missing && `, ${words.missing}`}
      </span>
    </li>
  );
}

export function StatRows<T>({ majors }: { majors: PathMajor<T>[] }) {
  if (majors.length === 0) return null;
  const widest = Math.max(1, ...majors.map((group) => group.counts.total));
  // A bar is a comparison, and one group has nothing to compare itself with: its width would be
  // 100% of itself on every path, which is the same picture for every Technology. The words carry
  // the counts on their own, so the lane goes and they stay (DESIGN.md, Stat Row).
  const bars = majors.length > 1;
  const counts = majors.map((group) => group.counts);
  const levels = bars ? legendLevels(counts) : [];
  const action = bars && barHasAction(counts);

  return (
    <>
      {/* One grid for all rows, so every bar is measured against the same track. */}
      <ul
        aria-label="Releases per major version"
        className={`mt-5 grid max-w-[820px] gap-x-4 border-t border-rule font-mono text-diagnostic ${bars ? WITH_BAR : WORDS_ONLY}`}
      >
        {majors.map((group) => (
          <StatRow key={group.major} major={group.major} counts={group.counts} widest={widest} bars={bars} />
        ))}
      </ul>
      {/* The only place shapes and fills are mapped to words, so it is read out as well as seen: the
          prefix is what keeps it from arriving as three bare words after the rows that just said
          them. */}
      {levels.length > 0 && (
        <ul aria-label="Bar fills" className="mt-2 flex list-none flex-wrap gap-4 font-mono text-meta text-text-faint">
          {levels.map((level) => (
            <li key={level} className="inline-flex items-center gap-[6px]">
              <SignificanceGlyph significance={level} />
              <i aria-hidden className={`inline-block h-2 w-[10px] ${FILL[level]}`} />
              {level}
            </li>
          ))}
          {action && (
            <li className="inline-flex items-center gap-[6px]">
              <i aria-hidden className="inline-block h-[2px] w-[10px] bg-action" />
              needs action
            </li>
          )}
        </ul>
      )}
    </>
  );
}
