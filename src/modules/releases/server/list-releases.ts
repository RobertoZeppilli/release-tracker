import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SummaryVerdictSchema } from "@/modules/summaries";
import { SummaryStatusSchema } from "../domain/initial-summary-status";
import { SignificanceSchema } from "../domain/significance";
import type { SummarizedRelease } from "../domain/upgrade-path";

const ReleaseRowSchema = z.object({
  version: z.string(),
  significance: SignificanceSchema,
  significance_override: SignificanceSchema.nullable(),
  published_at: z.iso.datetime({ offset: true }),
  summaries: z.object({ status: SummaryStatusSchema, content: z.unknown() }).nullable(),
});

// A Significance Override always wins over the Classification Strategy.
export async function listReleases(db: SupabaseClient, technologyId: string): Promise<SummarizedRelease[]> {
  const { data, error } = await db
    .from("releases")
    .select("version, significance, significance_override, published_at, summaries (status, content)")
    .eq("technology_id", technologyId);
  if (error) throw error;
  return z
    .array(ReleaseRowSchema)
    .parse(data)
    .map((row) => ({
      version: row.version,
      significance: row.significance_override ?? row.significance,
      publishedAt: new Date(row.published_at),
      summaryStatus: row.summaries?.status ?? null,
      actionRequired: readVerdict(row.summaries),
    }));
}

// Content that does not match the schema counts as no Summary: never as safe to upgrade.
function readVerdict(summary: { status: string; content: unknown } | null): boolean | null {
  if (summary?.status !== "ready") return null;
  const verdict = SummaryVerdictSchema.safeParse(summary.content);
  return verdict.success ? verdict.data.actionRequired : null;
}
