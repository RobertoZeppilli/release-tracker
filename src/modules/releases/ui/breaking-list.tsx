import { OctagonAlert } from "lucide-react";
import { InlineCode } from "@/modules/summaries/ui";
import type { BreakingChange } from "@/modules/summaries";

// DESIGN.md, Release Row: what an action Release lists under its verdict, the coral octagon and
// `breaking[n]:` in Mono 13px, then the Grotesk 14px title. One component, because the row reads
// the same on the Technology page, on the Upgrade Path and in the Dashboard's Stream.
// `label` names the Release in the list's accessible name: on a surface that mixes Technologies
// the version alone does not say which Release the changes belong to.
export function BreakingList({ label, changes }: { label: string; changes: readonly BreakingChange[] }) {
  return (
    <ul aria-label={`Breaking changes in ${label}`} className="mt-3 text-diagnostic leading-[1.6]">
      {changes.map((change, index) => (
        <li key={change.change} className="grid grid-cols-[auto_1fr] gap-x-3 py-[2px] phone:grid-cols-1">
          <span className="font-mono text-label leading-[1.75] whitespace-nowrap text-breaking">
            <OctagonAlert aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
            breaking[{index + 1}]:
          </span>
          <span>
            <InlineCode text={change.change} />
          </span>
        </li>
      ))}
    </ul>
  );
}
