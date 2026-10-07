import { BackPointer } from "@/components/help-pointer";
import type { RecordedHistory } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { StatRows } from "./stat-rows";
import { historySentence } from "./upgrade-path-copy";

// What an emptied field asks for: the whole history, with the orientation a path gives and none of
// its claims. The note says what is on the screen, the bars compare the majors against each other,
// and the pointer back exists because the link that leads here is the last line of the page: a
// reader who followed it would otherwise have the browser's Back as the only way to the reading.
export function HistoryOverview<T>({ history, base }: { history: RecordedHistory<T>; base: string }) {
  return (
    <section aria-label="Recorded history" className="mt-6">
      <p className="font-mono text-diagnostic text-text-muted">
        <SeverityLabel tone="muted" label="note:" /> {historySentence(history)}
      </p>
      <StatRows majors={history.majors} />
      <p className="mt-5">
        <BackPointer href={base}>back to the upgrade path</BackPointer>
      </p>
    </section>
  );
}
