import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { latestStableVersion } from "@/modules/releases";
import type { PickerTechnology } from "../domain/picker";

const PickerRowSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  retired: z.boolean(),
  releases: z.array(z.object({ version: z.string() })),
});

// One query for the whole picker: Versions are short strings and the page is behind the login, so a
// per Technology query would cost far more than the rows it saves.
export async function listPickerTechnologies(db: SupabaseClient): Promise<PickerTechnology[]> {
  const { data, error } = await db
    .from("technologies")
    .select("id, slug, name, description, retired, releases (version)");
  if (error) throw error;
  return z
    .array(PickerRowSchema)
    .parse(data)
    .map(({ releases, ...technology }) => ({
      ...technology,
      latest: latestStableVersion(releases.map((release) => release.version)),
    }));
}
