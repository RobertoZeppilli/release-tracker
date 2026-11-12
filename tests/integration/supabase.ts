import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inject } from "vitest";
import { z } from "zod";

const options = { auth: { persistSession: false, autoRefreshToken: false } };

const IdRowSchema = z.object({ id: z.uuid() });

export function anonClient(): SupabaseClient {
  const { API_URL, PUBLISHABLE_KEY } = inject("supabase");
  return createClient(API_URL, PUBLISHABLE_KEY, options);
}

export function serviceClient(): SupabaseClient {
  const { API_URL, SECRET_KEY } = inject("supabase");
  return createClient(API_URL, SECRET_KEY, options);
}

// ⚠️ **One reader and one table.** Until issue #210 every test made a Developer of its own and RLS
// kept their rows apart; there is no account to make now, so `follows` and the three notification
// tables are shared by the whole suite. Files do not interleave (`fileParallelism: false` in
// `vitest.config.mts`), so what each file owes the next one is to leave the tables as it found
// them: that is what `clearFollows` is for.
export async function clearFollows(): Promise<void> {
  const { error } = await serviceClient().from("follows").delete().not("technology_id", "is", null);
  if (error) throw error;
}

export type Content = { technologyId: string; releaseId: string };

// A Technology with one Release, its notes and a Summary, written with the service role.
export async function seedContent(): Promise<Content> {
  const db = serviceClient();
  const slug = `tech-${randomUUID()}`;

  const technology = await db
    .from("technologies")
    .insert({ slug, name: slug, category: "library", classification_strategy: "semver" })
    .select("id")
    .single();
  if (technology.error) throw technology.error;
  const technologyId = IdRowSchema.parse(technology.data).id;

  const release = await db
    .from("releases")
    .insert({
      technology_id: technologyId,
      version: "1.0.0",
      significance: "featured",
      origin: "detected",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (release.error) throw release.error;
  const releaseId = IdRowSchema.parse(release.data).id;

  const notes = await db.from("release_notes").insert({ release_id: releaseId, body: "## Changes" });
  if (notes.error) throw notes.error;
  const summary = await db.from("summaries").insert({ release_id: releaseId, status: "pending" });
  if (summary.error) throw summary.error;

  return { technologyId, releaseId };
}

export async function deleteContent({ technologyId, releaseId }: Content): Promise<void> {
  const db = serviceClient();
  for (const [table, column, id] of [
    // Before the Releases: a Notification points at one (ADR 0009).
    ["notifications", "release_id", releaseId],
    ["summaries", "release_id", releaseId],
    ["release_notes", "release_id", releaseId],
    ["follows", "technology_id", technologyId],
    ["releases", "technology_id", technologyId],
    ["technologies", "id", technologyId],
  ] as const) {
    const { error } = await db.from(table).delete().eq(column, id);
    if (error) throw error;
  }
}

export type Catalog = { technologyIds: string[]; remove: () => Promise<void> };

// Bare Technologies, as many as a test asks for: no Releases, no Sources, no Summaries.
export async function seedCatalog(count: number): Promise<Catalog> {
  const db = serviceClient();
  const rows = Array.from({ length: count }, () => {
    const slug = `tech-${randomUUID()}`;
    return { slug, name: slug, category: "library" as const, classification_strategy: "semver" as const };
  });

  const inserted = await db.from("technologies").insert(rows).select("id");
  if (inserted.error) throw inserted.error;
  const technologyIds = z.array(IdRowSchema).parse(inserted.data).map((row) => row.id);

  return {
    technologyIds,
    remove: async () => {
      for (const [table, column] of [
        ["follows", "technology_id"],
        ["technologies", "id"],
      ] as const) {
        const { error } = await db.from(table).delete().in(column, technologyIds);
        if (error) throw error;
      }
    },
  };
}

export async function retire(technologyId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("technologies")
    .update({ retired: true })
    .eq("id", technologyId);
  if (error) throw error;
}
