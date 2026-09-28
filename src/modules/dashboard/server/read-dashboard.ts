import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { DashboardRelease, FollowedTechnology } from "../domain/build-dashboard";
import { SignificanceSchema, SummaryStatusSchema } from "@/modules/releases";
import { SummaryContentSchema } from "@/modules/summaries";

const ReleaseRowSchema = z.object({
  version: z.string(),
  significance: SignificanceSchema,
  significance_override: SignificanceSchema.nullable(),
  published_at: z.iso.datetime({ offset: true }),
  summaries: z.object({ status: SummaryStatusSchema, content: z.unknown() }).nullable(),
});

const FollowRowSchema = z.object({
  technologies: z.object({
    slug: z.string(),
    name: z.string(),
    releases: z.array(ReleaseRowSchema),
  }),
});

export type DashboardData = { followed: FollowedTechnology[]; releases: DashboardRelease[] };

// One query for the whole page, read with the Developer's own client: RLS picks their follows, so
// the query carries no `user_id`. Every Release comes back, not just the window: the compact row
// needs the latest major however old, and the Weekly Digest of the next slice needs them all.
export async function readDashboard(db: SupabaseClient): Promise<DashboardData> {
  const { data, error } = await db
    .from("follows")
    .select(
      "technologies!inner (slug, name, releases (version, significance, significance_override, published_at, summaries (status, content)))",
    );
  if (error) throw error;

  const rows = z.array(FollowRowSchema).parse(data).map((row) => row.technologies);
  return {
    followed: rows.map(({ slug, name }) => ({ slug, name })),
    releases: rows.flatMap((technology) =>
      technology.releases.map((release) => toDashboardRelease(technology.slug, release)),
    ),
  };
}

type ReleaseRow = z.infer<typeof ReleaseRowSchema>;

// A Significance Override always wins over the Classification Strategy, as on the Technology page.
// Content that does not match the schema counts as no Summary: never as safe to upgrade.
function toDashboardRelease(slug: string, row: ReleaseRow): DashboardRelease {
  const ready = row.summaries?.status === "ready" ? SummaryContentSchema.safeParse(row.summaries.content) : null;
  return {
    slug,
    version: row.version,
    significance: row.significance_override ?? row.significance,
    publishedAt: new Date(row.published_at),
    summaryStatus: row.summaries?.status ?? null,
    summary: ready?.success ? ready.data : null,
  };
}
