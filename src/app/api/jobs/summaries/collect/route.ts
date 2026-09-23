import { revalidateReleasePages } from "@/modules/releases/server";
import { collectSummaryBatches } from "@/modules/summaries/server";
import { runSummaryJob } from "../job";

// Phase two of the Summaries (ADR 0007): a later run reads the batches sent by phase one.
// A settled Summary changes what the public pages say, so their ISR entries are marked stale here,
// where `revalidatePath` is allowed; the report names the paths instead of the Releases.
export async function GET(request: Request): Promise<Response> {
  return runSummaryJob(request, async (db, batches) => {
    const { changed, ...report } = await collectSummaryBatches(db, batches);
    return { ...report, revalidated: revalidateReleasePages(changed) };
  });
}
