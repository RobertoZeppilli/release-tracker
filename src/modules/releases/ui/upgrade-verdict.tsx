import type { PathCounts, PathMajor } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { StatRows } from "./stat-rows";
import { pathSentence, pathVerdict } from "./upgrade-path-copy";

export function UpgradeVerdict<T>({ from, to, counts, majors }: { from: string; to: string; counts: PathCounts; majors: PathMajor<T>[] }) {
  const verdict = pathVerdict(counts);
  return (
    <section aria-labelledby="path-verdict" className="mt-6">
      <h2 id="path-verdict" className="font-mono text-verdict">
        <SeverityLabel tone={verdict.tone} label={verdict.label} /> {verdict.claim}
      </h2>
      <p className="mt-3 max-w-measure text-body text-text-muted">{pathSentence(from, to, counts)}</p>
      <StatRows majors={majors} />
    </section>
  );
}
