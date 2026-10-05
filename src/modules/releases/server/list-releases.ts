import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import { judge, type NotesHead, storedNotesHead, type SummaryContent, SummaryContentSchema } from "@/modules/summaries";
import { SummaryStatusSchema } from "../domain/initial-summary-status";
import { SignificanceSchema } from "../domain/significance";
import type { SummarizedRelease } from "../domain/upgrade-path";

const ReleaseRowSchema = z.object({
  version: z.string(),
  significance: SignificanceSchema,
  significance_override: SignificanceSchema.nullable(),
  published_at: z.iso.datetime({ offset: true }),
  summaries: z.object({ status: SummaryStatusSchema, content: z.unknown() }).nullable(),
  // Only the head of the notes: enough to judge them, and bounded whatever the Release carries.
  release_notes: z.object({ body_head: z.string().nullable() }).nullable(),
});

// A Significance Override always wins over the Classification Strategy.
export async function listReleases(db: SupabaseClient, technologyId: string): Promise<SummarizedRelease[]> {
  const data = await selectAllRows((from, to) =>
    db
      .from("releases")
      .select(
        "version, significance, significance_override, published_at, summaries (status, content), release_notes (body_head)",
      )
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
      ...readSummary(row.summaries, storedNotesHead(row.release_notes?.body_head)),
    }));
}

// Content that does not match the schema counts as no Summary: never as safe to upgrade.
function readSummary(
  stored: { status: string; content: unknown } | null,
  notes: NotesHead | null,
): { actionRequired: boolean | null; unjudged: boolean; summary: SummaryContent | null } {
  if (stored?.status !== "ready") return { actionRequired: null, unjudged: false, summary: null };
  const parsed = SummaryContentSchema.safeParse(stored.content);
  if (!parsed.success) return { actionRequired: null, unjudged: false, summary: null };
  return { ...judge(parsed.data.actionRequired, notes), summary: parsed.data };
}
