import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/env/server";
import { isAuthorizedJob } from "@/lib/job-auth";
import { createServiceClient } from "@/lib/supabase-server";
import type { SummaryBatches } from "@/modules/summaries";
import { createSummaryBatches } from "@/modules/summaries/server";

// Shared by the two summary phases: the secret first, then the batches adapter, then the phase.
export async function runSummaryJob(
  request: Request,
  phase: (db: SupabaseClient, batches: SummaryBatches) => Promise<object>,
): Promise<Response> {
  if (!isAuthorizedJob(request, serverEnv.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const batches = createSummaryBatches(serverEnv.ANTHROPIC_API_KEY);
  if (batches === null) {
    return Response.json({ error: "summaries are not configured: no Message Batches adapter" }, { status: 503 });
  }
  return Response.json(await phase(createServiceClient(), batches));
}
