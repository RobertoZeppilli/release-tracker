import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { selectAllRows } from "@/lib/supabase-rows";
import { type SitemapPage, sitemapPages } from "../domain/sitemap";

const TechnologyRowSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  updated_at: z.iso.datetime({ offset: true }),
});

const ReleaseRowSchema = z.object({
  technology_id: z.uuid(),
  version: z.string(),
  created_at: z.iso.datetime({ offset: true }),
  summaries: z.object({ updated_at: z.iso.datetime({ offset: true }) }).nullable(),
});

// Two queries instead of one with the Releases embedded: PostgREST pages the rows it returns, and
// only the outer ones, so a Technology with many Releases would come back quietly truncated.
// Retired Technologies are not filtered out: their pages stay reachable.
export async function listSitemapPages(db: SupabaseClient): Promise<SitemapPage[]> {
  const [technologies, releases] = await Promise.all([
    selectAllRows((from, to) => db.from("technologies").select("id, slug, updated_at").order("slug").range(from, to)),
    selectAllRows((from, to) =>
      db
        .from("releases")
        .select("technology_id, version, created_at, summaries (updated_at)")
        // By `id` and not by date: paging over a column with ties can repeat or skip a row, and a
        // whole import batch shares one `created_at`. The order of the pages is the domain's job.
        .order("id")
        .range(from, to),
    ),
  ]);
  return sitemapPages(
    z.array(TechnologyRowSchema).parse(technologies).map((row) => ({
      id: row.id,
      slug: row.slug,
      lastModified: new Date(row.updated_at),
    })),
    // A Release page changes when the Release is recorded and again when its Summary settles,
    // and the later of the two is the day the page last said something new.
    z.array(ReleaseRowSchema).parse(releases).map((row) => ({
      technologyId: row.technology_id,
      version: row.version,
      lastModified: latest(row.created_at, row.summaries?.updated_at),
    })),
  );
}

function latest(recorded: string, settled: string | undefined): Date {
  const dates = [new Date(recorded), ...(settled ? [new Date(settled)] : [])];
  return dates.reduce((a, b) => (a > b ? a : b));
}
