import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import { type SummaryContent, SummaryContentSchema } from "@/modules/summaries";
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
  const data = await selectAllRows((from, to) =>
    db
      .from("releases")
      .select("version, significance, significance_override, published_at, summaries (status, content)")
      .eq("technology_id", technologyId)
      .order("published_at")
      .range(from, to),
  );
  return z
    .array(ReleaseRowSchema)
    .parse(data)
    .map((row) => ({
      version: row.version,
      significance: row.significance_override ?? row.significance,
      publishedAt: new Date(row.published_at),
      summaryStatus: row.summaries?.status ?? null,
      ...readSummary(row.summaries),
    }));
}

// Content that does not match the schema counts as no Summary: never as safe to upgrade.
function readSummary(stored: { status: string; content: unknown } | null): {
  actionRequired: boolean | null;
  summary: SummaryContent | null;
} {
  if (stored?.status !== "ready") return { actionRequired: null, summary: null };
  const parsed = SummaryContentSchema.safeParse(stored.content);
  if (!parsed.success) return { actionRequired: null, summary: null };
  return { actionRequired: parsed.data.actionRequired, summary: parsed.data };
}
