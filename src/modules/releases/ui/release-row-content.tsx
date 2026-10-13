import { HelpPointer } from "@/components/help-pointer";
import { InlineCode } from "@/modules/summaries/ui";
import { BreakingList } from "./breaking-list";
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
      <ReleaseVerdict slug={slug} release={release} />
      {breaking.length > 0 && (
        <>
          <BreakingList label={release.version} changes={breaking} />
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
