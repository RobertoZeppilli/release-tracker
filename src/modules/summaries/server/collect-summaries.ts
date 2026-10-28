import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import type { SummaryBatches, SummaryResult } from "../domain/summary-batches";
import { parseSummaryOutput } from "../domain/summary-output";
import type { SummaryScope } from "./summary-scope";

const SubmittedSchema = z.array(
  z.object({
    release_id: z.uuid(),
    batch_id: z.string(),
    releases: z.object({ version: z.string(), technologies: z.object({ slug: z.string() }) }),
  }),
);

// How the public pages address a Release, so the caller can revalidate them without another query.
type ChangedRelease = { slug: string; version: string };

// `pending`: put back in the queue, to be taken again by a later run.
// `changed`: every Release whose Summary was settled, whatever the outcome — each of them reads
// differently on its page now.
export type CollectReport = {
  ready: string[];
  failed: string[];
  stillProcessing: string[];
  pending: string[];
  changed: ChangedRelease[];
};

// Phase two of ADR 0007: read the results of every batch sent by an earlier run and validate them.
export async function collectSummaryBatches(
  db: SupabaseClient,
  batches: SummaryBatches,
  { technologyIds }: SummaryScope = {},
): Promise<CollectReport> {
  // Paged: a run that submitted the whole Catalog leaves more than a thousand Summaries
  // `processing`, and unpaged each run saw only the first thousand of them (issue #190).
  const submitted = await selectAllRows((from, to) => {
    const query = db
      .from("summaries")
      .select("release_id, batch_id, releases!inner(version, technologies!inner(slug))")
      .eq("status", "processing")
      .not("batch_id", "is", null);
    if (technologyIds) query.in("releases.technology_id", technologyIds);
    // By the primary key, the only order over these rows without ties.
    return query.order("release_id").range(from, to);
  });

  const byBatch = new Map<string, string[]>();
  const pageOf = new Map<string, ChangedRelease>();
  for (const row of SubmittedSchema.parse(submitted)) {
    byBatch.set(row.batch_id, [...(byBatch.get(row.batch_id) ?? []), row.release_id]);
    pageOf.set(row.release_id, { slug: row.releases.technologies.slug, version: row.releases.version });
  }

  const report: CollectReport = { ready: [], failed: [], stillProcessing: [], pending: [], changed: [] };
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
      const page = pageOf.get(releaseId);
      if (page) report.changed.push(page);
    }
  }
  return report;
}

type Outcome =
  | { status: "ready"; content: unknown; failure_reason: null }
  | { status: "failed"; content: null; failure_reason: string }
  | { status: "pending"; content: null; failure_reason: null; batch_id: null };

function settle(result: SummaryResult | undefined): Outcome {
  if (result === undefined) return failed("missing from the batch results");
  // Not the request's fault, so it goes back in the queue instead of being spent (ADR 0007).
  if (result.type === "credit_exhausted") return { status: "pending", content: null, failure_reason: null, batch_id: null };
  if (result.type !== "succeeded") return failed(`batch request ${result.type}: ${result.message}`);
  const parsed = parseSummaryOutput(result.text);
  return parsed.ok ? { status: "ready", content: parsed.content, failure_reason: null } : failed(parsed.reason);
}

function failed(reason: string): Outcome {
  return { status: "failed", content: null, failure_reason: reason };
}
