import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CategorySchema } from "@/modules/catalog";
import { latestStableRelease } from "@/modules/releases";
import type { PickerTechnology } from "../domain/picker";

const PickerRowSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  retired: z.boolean(),
  category: CategorySchema,
  releases: z.array(z.object({ version: z.string(), published_at: z.iso.datetime({ offset: true }) })),
});

// One query for the whole picker: Versions are short strings and the page is behind the login, so a
// per Technology query would cost far more than the rows it saves.
export async function listPickerTechnologies(db: SupabaseClient): Promise<PickerTechnology[]> {
  const { data, error } = await db
    .from("technologies")
    .select("id, slug, name, description, retired, category, releases (version, published_at)");
  if (error) throw error;
  return z
    .array(PickerRowSchema)
    .parse(data)
    .map(({ releases, ...technology }) => {
      const latest = latestStableRelease(releases);
      return {
        ...technology,
        latest: latest?.version ?? null,
        latestAt: latest ? isoDay(latest.published_at) : null,
      };
    });
}

// The day, and not the instant: the row prints `latest 8.3.3 on 2026-10-06`, and the ordering reads
// the same string, so both are the same fact seen once.
function isoDay(timestamp: string): string {
  return timestamp.slice(0, 10);
}
