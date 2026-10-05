import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { judge, notesHead, type StoredSummary, SummaryContentSchema } from "@/modules/summaries";
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
  const summary = readSummary(row.summaries);
  // The page already carries the whole body, so the head comes from it instead of a second column.
  const notes = row.release_notes ? notesHead(row.release_notes.body) : null;
  return {
    version: row.version,
    significance: row.significance_override ?? row.significance,
    origin: row.origin,
    publishedAt: new Date(row.published_at),
    recordedAt: new Date(row.created_at),
    notes: row.release_notes,
    summaryStatus: row.summaries?.status ?? null,
    summary,
    unjudged: summary !== null && judge(summary.content.actionRequired, notes).unjudged,
  };
}

// Stored content is checked again on read: a row that does not validate shows as unavailable. The
// provenance is read the same way instead of being trusted: the constraint of issue #88 keeps a ready
// row from losing it, and a row that somehow did is not a Summary we are willing to show.
function readSummary(summary: z.infer<typeof ReleaseDetailRowSchema>["summaries"]): StoredSummary | null {
  if (summary?.status !== "ready") return null;
  const { model, prompt_version: promptVersion } = summary;
  if (model === null || promptVersion === null) return null;
  const content = SummaryContentSchema.safeParse(summary.content);
  return content.success ? { content: content.data, model, promptVersion } : null;
}
