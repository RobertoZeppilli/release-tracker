import type { PathCounts, PathMajor } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { majorWords } from "./upgrade-path-copy";

// DESIGN.md, Stat Row. Shared by the Upgrade Path verdict and by the whole recorded history, which
// reads the same bars without a verdict above them: one geometry, so the two never drift apart.
const SEGMENTS = [
  { kind: "featured", className: "bg-text" },
  { kind: "notable", className: "bg-text-muted" },
  { kind: "digest", className: "bg-rule-strong" },
] as const;

function StatRow({ major, counts, widest }: { major: number; counts: PathCounts; widest: number }) {
  const words = majorWords(counts);
  return (
    <li className="col-span-full grid grid-cols-subgrid items-center border-b border-rule py-2">
      <span className="text-text">v{major}</span>
      <span aria-hidden className="text-text-faint max-[640px]:hidden">
        |
      </span>
      <span aria-hidden className="block max-[640px]:hidden">
        <span className="flex h-2 min-w-7 gap-[2px]" style={{ width: `${(counts.total / widest) * 100}%` }}>
          {SEGMENTS.map(({ kind, className }) =>
            counts[kind] > 0 ? <span key={kind} className={`block h-full ${className}`} style={{ flex: counts[kind] }} /> : null,
          )}
        </span>
      </span>
      <span className="text-text-muted">
        {words.kinds}
        {words.action && (
          <>
            {" · "}
            <SeverityLabel tone="action" label={words.action} />
          </>
        )}
        {words.missing && ` · ${words.missing}`}
      </span>
    </li>
  );
}

export function StatRows<T>({ majors }: { majors: PathMajor<T>[] }) {
  if (majors.length === 0) return null;
  const widest = Math.max(1, ...majors.map((group) => group.counts.total));

  return (
    <>
      {/* One grid for all rows, so every bar is measured against the same track. */}
      <ul
        aria-label="Releases per major version"
        className="mt-5 grid max-w-[820px] grid-cols-[3ch_1ch_minmax(120px,1fr)_auto] gap-x-4 border-t border-rule font-mono text-diagnostic max-[640px]:grid-cols-[3ch_1fr]"
      >
        {majors.map((group) => (
          <StatRow key={group.major} major={group.major} counts={group.counts} widest={widest} />
        ))}
      </ul>
      <p aria-hidden className="mt-2 flex flex-wrap gap-4 font-mono text-meta text-text-faint">
        {SEGMENTS.map(({ kind, className }) => (
          <span key={kind} className="inline-flex items-center gap-[6px]">
            <i className={`inline-block h-2 w-[10px] ${className}`} />
            {kind}
          </span>
        ))}
      </p>
    </>
  );
}
