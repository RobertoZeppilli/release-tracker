import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SummaryBatches, SummaryResult } from "../domain/summary-batches";
import { parseSummaryOutput } from "../domain/summary-output";

const SubmittedSchema = z.array(z.object({ release_id: z.uuid(), batch_id: z.string() }));

export type CollectReport = { ready: string[]; failed: string[]; stillProcessing: string[] };

// Phase two of ADR 0007: read the results of every batch sent by an earlier run and validate them.
export async function collectSummaryBatches(db: SupabaseClient, batches: SummaryBatches): Promise<CollectReport> {
  const { data, error } = await db
    .from("summaries")
    .select("release_id, batch_id")
    .eq("status", "processing")
    .not("batch_id", "is", null);
  if (error) throw error;

  const byBatch = new Map<string, string[]>();
  for (const row of SubmittedSchema.parse(data)) {
    byBatch.set(row.batch_id, [...(byBatch.get(row.batch_id) ?? []), row.release_id]);
  }

  const report: CollectReport = { ready: [], failed: [], stillProcessing: [] };
  for (const [batchId, releaseIds] of byBatch) {
    const results = await batches.collect(batchId);
    if (results === null) {
      report.stillProcessing.push(...releaseIds);
      continue;
    }
    for (const releaseId of releaseIds) {
      const outcome = settle(results.get(releaseId));
      // Guarded on the batch, so a run that overlaps this one cannot settle the Summary twice.
      const update = await db
        .from("summaries")
        .update({ ...outcome, updated_at: new Date().toISOString() })
        .eq("release_id", releaseId)
        .eq("status", "processing")
        .eq("batch_id", batchId);
      if (update.error) throw update.error;
      report[outcome.status].push(releaseId);
    }
  }
  return report;
}

type Outcome =
  | { status: "ready"; content: unknown; failure_reason: null }
  | { status: "failed"; content: null; failure_reason: string };

function settle(result: SummaryResult | undefined): Outcome {
  if (result === undefined) return failed("missing from the batch results");
  if (result.type !== "succeeded") return failed(`batch request ${result.type}: ${result.message}`);
  const parsed = parseSummaryOutput(result.text);
  return parsed.ok ? { status: "ready", content: parsed.content, failure_reason: null } : failed(parsed.reason);
}

function failed(reason: string): Outcome {
  return { status: "failed", content: null, failure_reason: reason };
}
