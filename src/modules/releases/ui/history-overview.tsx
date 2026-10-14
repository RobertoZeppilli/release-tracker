import { BackPointer } from "@/components/help-pointer";
import type { RecordedHistory } from "../domain/upgrade-path";
import { SeverityLabel } from "./severity-label";
import { historySentence } from "./upgrade-path-copy";

// What an emptied field asks for: the whole history, with none of a path's claims. The note says
// what is on the screen, and the pointer back exists because the link that leads here is the last
// line of the plan: a reader who followed it would otherwise have the browser's Back as the only way
// to the reading.
//
// The bars that used to sit here are the group titles of the list now (DESIGN.md, Stat Row): they
// compare the majors against each other, which is a thing to say beside the groups and not about
// them from the other column.
export function HistoryOverview<T>({ history, base }: { history: RecordedHistory<T>; base: string }) {
  return (
    <section aria-label="Recorded history" className="mt-5">
      <p className="font-mono text-diagnostic text-text-muted stacked:max-w-measure">
        <SeverityLabel tone="muted" label="note:" /> {historySentence(history)}
      </p>
      <p className="mt-5">
        <BackPointer href={base}>back to the upgrade path</BackPointer>
      </p>
    </section>
  );
}
