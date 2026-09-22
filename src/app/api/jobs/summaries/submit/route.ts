import { submitPendingSummaries } from "@/modules/summaries/server";
import { runSummaryJob } from "../job";

// Phase one of the Summaries (ADR 0007). GET because Vercel Cron calls with GET (issue #15).
export async function GET(request: Request): Promise<Response> {
  return runSummaryJob(request, (db, batches) => submitPendingSummaries(db, batches));
}
