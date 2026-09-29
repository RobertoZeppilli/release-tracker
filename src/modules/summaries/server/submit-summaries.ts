import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CreditExhaustedError, type SummaryBatches, type SummaryRequest } from "../domain/summary-batches";
import { PROMPT_VERSION, prepareSummaryRequest, SUMMARY_MODEL } from "../domain/summary-prompt";
import { chunks } from "./chunks";
import type { SummaryScope } from "./summary-scope";

const ClaimedSchema = z.array(z.object({ release_id: z.uuid() }));

const ClaimedReleaseSchema = z.array(
  z.object({
    id: z.uuid(),
    version: z.string(),
    technologies: z.object({ name: z.string() }),
    release_notes: z.object({ body: z.string() }).nullable(),
  }),
);

// `pending`: claimed but put back in the queue, to be taken again by a later run.
export type SubmitReport = { batchId: string | null; submitted: string[]; failed: string[]; pending: string[] };

// Phase one of ADR 0007: take the pending Summaries and send them in a single batch.
// The collect run, a later execution, reads the results.
export async function submitPendingSummaries(
  db: SupabaseClient,
  batches: SummaryBatches,
  { maxCount = 1000, technologyIds }: { maxCount?: number } & SummaryScope = {},
): Promise<SubmitReport> {
  const claimed = await db.rpc("claim_pending_summaries", {
    max_count: maxCount,
    technology_ids: technologyIds ?? null,
  });
  if (claimed.error) throw claimed.error;
  const ids = ClaimedSchema.parse(claimed.data).map((row) => row.release_id);
  if (ids.length === 0) return { batchId: null, submitted: [], failed: [], pending: [] };

  const requests: SummaryRequest[] = [];
  const failed: string[] = [];
  for (const release of await loadReleases(db, ids)) {
    const prepared = prepareSummaryRequest({
      releaseId: release.id,
      technologyName: release.technologies.name,
      version: release.version,
      notes: release.release_notes?.body ?? "",
    });
    if (prepared.ok) {
      requests.push(prepared.request);
    } else {
      await markFailed(db, release.id, prepared.reason);
      failed.push(release.id);
    }
  }
  if (requests.length === 0) return { batchId: null, submitted: [], failed, pending: [] };

  const sending = requests.map((request) => request.releaseId);
  let batchId: string;
  try {
    batchId = await batches.submit(requests);
  } catch (error) {
    // Nothing was sent: the next run takes these Summaries again.
    await setStatus(db, sending, { status: "pending" });
    // An exhausted credit is a wait, not a failure, so the job reports it instead of erroring.
    if (error instanceof CreditExhaustedError) return { batchId: null, submitted: [], failed, pending: sending };
    throw error;
  }
  await setStatus(db, sending, { batch_id: batchId, model: SUMMARY_MODEL, prompt_version: PROMPT_VERSION });
  return { batchId, submitted: sending, failed, pending: [] };
}

async function loadReleases(db: SupabaseClient, ids: string[]) {
  const releases = [];
  for (const part of chunks(ids)) {
    const { data, error } = await db
      .from("releases")
      .select("id, version, technologies (name), release_notes (body)")
      .in("id", part);
    if (error) throw error;
    releases.push(...ClaimedReleaseSchema.parse(data));
  }
  return releases;
}

async function markFailed(db: SupabaseClient, releaseId: string, reason: string): Promise<void> {
  await setStatus(db, [releaseId], { status: "failed", failure_reason: reason });
}

async function setStatus(db: SupabaseClient, ids: string[], values: Record<string, string>): Promise<void> {
  for (const part of chunks(ids)) {
    const { error } = await db
      .from("summaries")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("status", "processing")
      .in("release_id", part);
    if (error) throw error;
  }
}
