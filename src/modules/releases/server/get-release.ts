import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { type StoredSummary, SummaryContentSchema } from "@/modules/summaries";
import { SummaryStatusSchema } from "../domain/initial-summary-status";
import type { ReleaseDetail } from "../domain/release-page";
import { SignificanceSchema } from "../domain/significance";

// release_notes and summaries share the Release's primary key, so each embeds as one object or null.
const ReleaseDetailRowSchema = z.object({
  version: z.string(),
  significance: SignificanceSchema,
  significance_override: SignificanceSchema.nullable(),
  origin: z.enum(["imported", "detected"]),
  published_at: z.iso.datetime({ offset: true }),
  created_at: z.iso.datetime({ offset: true }),
  release_notes: z.object({ body: z.string(), url: z.string().nullable() }).nullable(),
  summaries: z
    .object({
      status: SummaryStatusSchema,
      content: z.unknown(),
      model: z.string().nullable(),
      prompt_version: z.string().nullable(),
    })
    .nullable(),
});

export async function getRelease(db: SupabaseClient, technologyId: string, version: string): Promise<ReleaseDetail | null> {
  const { data, error } = await db
    .from("releases")
    .select(
      "version, significance, significance_override, origin, published_at, created_at, release_notes (body, url), summaries (status, content, model, prompt_version)",
    )
    .eq("technology_id", technologyId)
    .eq("version", version)
    .maybeSingle();
  if (error) throw error;
  if (data === null) return null;
  const row = ReleaseDetailRowSchema.parse(data);
  return {
    version: row.version,
    significance: row.significance_override ?? row.significance,
    origin: row.origin,
    publishedAt: new Date(row.published_at),
    recordedAt: new Date(row.created_at),
    notes: row.release_notes,
    summaryStatus: row.summaries?.status ?? null,
    summary: readSummary(row.summaries),
  };
}

// Stored content is checked again on read: a row that does not validate shows as unavailable.
function readSummary(summary: z.infer<typeof ReleaseDetailRowSchema>["summaries"]): StoredSummary | null {
  if (summary?.status !== "ready") return null;
  const content = SummaryContentSchema.safeParse(summary.content);
  return content.success ? { content: content.data, model: summary.model, promptVersion: summary.prompt_version } : null;
}
