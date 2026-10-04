import { OctagonAlert } from "lucide-react";
import { HelpPointer } from "@/components/help-pointer";
import { InlineCode } from "@/modules/summaries/ui";
import { releasePath } from "../domain/release-page";
import type { SummarizedRelease } from "../domain/upgrade-path";
import { ReleaseVerdict } from "./release-verdict";

// DESIGN.md, Release Row: the content column of one Release row. What the reader was opening N
// Release pages to find out -- what the Summary says, what breaks, where to go next -- the list
// declares here, once per row.
export function ReleaseRowContent({ slug, release }: { slug: string; release: SummarizedRelease }) {
  const breaking = release.summary?.breakingChanges ?? [];
  return (
    <>
      {release.summary && (
        <p className="text-body leading-[1.45] font-medium">
          <InlineCode text={release.summary.title} />
        </p>
      )}
      <ReleaseVerdict release={release} />
      {breaking.length > 0 && (
        <>
          <ul aria-label={`Breaking changes in ${release.version}`} className="mt-3 text-diagnostic leading-[1.6]">
            {breaking.map((change, index) => (
              <li key={change.change} className="grid grid-cols-[auto_1fr] gap-x-3 py-[2px] max-[640px]:grid-cols-1">
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
          {/* The pointer names the Release it leads to, so the label says where it goes without
              borrowing the row's own version link. */}
          <div className="mt-3">
            <HelpPointer href={releasePath(slug, release.version)}>
              migrate to {slug} {release.version}
            </HelpPointer>
          </div>
        </>
      )}
    </>
  );
}
