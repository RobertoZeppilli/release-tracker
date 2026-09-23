import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SummaryContent } from "@/modules/summaries";

const LocalSupabaseSchema = z.object({ API_URL: z.url(), SECRET_KEY: z.string().min(1) });
const IdRowSchema = z.object({ id: z.uuid() });

// The app reads the same local stack; the fixtures are written with the service role.
function serviceClient(): SupabaseClient {
  const output = execSync("pnpm exec supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const { API_URL, SECRET_KEY } = LocalSupabaseSchema.parse(JSON.parse(output.slice(output.indexOf("{"))));
  return createClient(API_URL, SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type FixtureRelease = {
  version: string;
  significance: "featured" | "notable" | "digest" | "preview";
  origin: "imported" | "detected";
  status: "pending" | "processing" | "ready" | "unavailable" | "skipped" | "failed";
  notes: string | null;
  // Only for a `ready` Summary: the verdict the Upgrade Path counts, with a generic content around it.
  actionRequired?: boolean;
  // Only for a `ready` Summary: stored as is, even if it does not validate.
  summary?: SummaryContent | Record<string, unknown>;
};

function contentFor(release: FixtureRelease): unknown {
  if (release.summary !== undefined) return release.summary;
  if (release.actionRequired === undefined) return null;
  return {
    title: `Fixture ${release.version} release.`,
    keyPoints: [{ text: "A first change." }, { text: "A second change." }, { text: "A third change." }],
    breakingChanges: release.actionRequired ? [{ change: "The default export is gone", migration: "Use the named export." }] : [],
    actionRequired: release.actionRequired,
  };
}

export type FixtureTechnology = { slug: string; name: string; repo: string; remove: () => Promise<void> };

// A Technology of its own for each run, so pages cached by earlier runs never interfere.
export async function seedTechnology(
  releases: FixtureRelease[],
  { retired = false }: { retired?: boolean } = {},
): Promise<FixtureTechnology> {
  const db = serviceClient();
  const slug = `e2e-${randomUUID().slice(0, 8)}`;
  const name = `Fixture ${slug.slice(4)}`;
  const repo = `fixture/${slug}`;

  const technology = await db
    .from("technologies")
    .insert({ slug, name, classification_strategy: "semver", retired })
    .select("id")
    .single();
  if (technology.error) throw technology.error;
  const technologyId = IdRowSchema.parse(technology.data).id;

  const sources = await db.from("sources").insert([
    { technology_id: technologyId, role: "detection", kind: "npm", config: { package: slug } },
    { technology_id: technologyId, role: "notes", kind: "github-releases", config: { repo, tagFormat: "v{version}" } },
  ]);
  if (sources.error) throw sources.error;

  for (const [index, release] of releases.entries()) {
    const inserted = await db
      .from("releases")
      .insert({
        technology_id: technologyId,
        version: release.version,
        significance: release.significance,
        origin: release.origin,
        published_at: new Date(Date.UTC(2026, 0, 10 + index)).toISOString(),
      })
      .select("id")
      .single();
    if (inserted.error) throw inserted.error;
    const releaseId = IdRowSchema.parse(inserted.data).id;
    if (release.notes !== null) {
      const url = `https://github.com/${repo}/releases/tag/v${release.version}`;
      const notes = await db.from("release_notes").insert({ release_id: releaseId, body: release.notes, url });
      if (notes.error) throw notes.error;
    }
    const summary = await db.from("summaries").insert({
      release_id: releaseId,
      status: release.status,
      content: contentFor(release),
      model: release.status === "ready" ? "claude-opus-5" : null,
      prompt_version: release.status === "ready" ? "v1" : null,
    });
    if (summary.error) throw summary.error;
  }

  async function remove() {
    const ids = await db.from("releases").select("id").eq("technology_id", technologyId);
    if (ids.error) throw ids.error;
    const releaseIds = z.array(IdRowSchema).parse(ids.data).map((row) => row.id);
    for (const table of ["summaries", "release_notes"] as const) {
      const { error } = await db.from(table).delete().in("release_id", releaseIds);
      if (error) throw error;
    }
    for (const [table, column] of [
      ["releases", "technology_id"],
      ["sources", "technology_id"],
      ["technologies", "id"],
    ] as const) {
      const { error } = await db.from(table).delete().eq(column, technologyId);
      if (error) throw error;
    }
  }

  return { slug, name, repo, remove };
}
