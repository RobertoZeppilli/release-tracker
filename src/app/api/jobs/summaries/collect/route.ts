import { collectSummaryBatches } from "@/modules/summaries/server";
import { runSummaryJob } from "../job";

// Phase two of the Summaries (ADR 0007): a later run reads the batches sent by phase one.
export async function GET(request: Request): Promise<Response> {
  return runSummaryJob(request, collectSummaryBatches);
}
