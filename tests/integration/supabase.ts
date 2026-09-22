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

export type Developer = { id: string; client: SupabaseClient };

export async function createDeveloper(): Promise<Developer> {
  const email = `dev-${randomUUID()}@example.test`;
  const password = randomUUID();
  const { data, error } = await serviceClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const client = anonClient();
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  return { id: data.user.id, client };
}

export async function deleteDeveloper(developer: Developer): Promise<void> {
  const { error } = await serviceClient().auth.admin.deleteUser(developer.id);
  if (error) throw error;
}

export type Content = { technologyId: string; releaseId: string };

// A Technology with one Release, its notes and a Summary, written with the service role.
export async function seedContent(): Promise<Content> {
  const db = serviceClient();
  const slug = `tech-${randomUUID()}`;

  const technology = await db
    .from("technologies")
    .insert({ slug, name: slug, classification_strategy: "semver" })
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
