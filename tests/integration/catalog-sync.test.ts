import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import type { CatalogEntry } from "@/modules/catalog";
import { syncCatalog } from "@/modules/catalog/server";
import { serviceClient } from "./supabase";

const slug = `sync-${randomUUID()}`;
const entry: CatalogEntry = {
  slug,
  name: "Sync test",
  description: "A Technology written by the Catalog sync",
  classificationStrategy: "semver",
  sources: [
    { role: "detection", kind: "npm", package: slug },
    { role: "notes", kind: "github-releases", repo: `test/${slug}`, tagFormat: "v{version}" },
  ],
};

const TechnologySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  retired: z.boolean(),
  updated_at: z.string(),
  sources: z.array(z.object({ id: z.uuid(), kind: z.string(), config: z.unknown() })),
});

async function readTechnology() {
  const { data, error } = await serviceClient()
    .from("technologies")
    .select("id, name, retired, updated_at, sources (id, kind, config)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return TechnologySchema.parse(data);
}

// The sync retires every Technology missing from `entries`, including ones this test did not write:
// remember them and bring them back afterwards.
let othersActive: string[] = [];

beforeAll(async () => {
  const { data, error } = await serviceClient().from("technologies").select("id").eq("retired", false);
  if (error) throw error;
  othersActive = z.array(z.object({ id: z.uuid() })).parse(data).map((row) => row.id);
});

function sync(entries: CatalogEntry[]) {
  return syncCatalog(serviceClient(), entries);
}

afterAll(async () => {
  const db = serviceClient();
  await db.from("technologies").update({ retired: false }).in("id", othersActive);

  const { id } = await readTechnology();
  const releases = await db.from("releases").select("id").eq("technology_id", id);
  const releaseIds = z.array(z.object({ id: z.uuid() })).parse(releases.data).map((row) => row.id);
  await db.from("release_notes").delete().in("release_id", releaseIds);
  await db.from("releases").delete().eq("technology_id", id);
  await db.from("sources").delete().eq("technology_id", id);
  await db.from("technologies").delete().eq("id", id);
});

describe("Catalog sync", () => {
  it("writes a new Technology with its Sources", async () => {
    const operations = await sync([entry]);
    expect(operations).toContainEqual({ type: "insert", entry });

    const technology = await readTechnology();
    expect(technology.retired).toBe(false);
    expect(technology.sources.map((source) => source.kind).sort()).toEqual(["github-releases", "npm"]);
  });

  it("changes nothing when run again", async () => {
    const before = await readTechnology();
    expect(await sync([entry])).toEqual([]);
    expect(await readTechnology()).toEqual(before);
  });

  it("deletes a removed Source but keeps the Release Notes it provided", async () => {
    const db = serviceClient();
    const technology = await readTechnology();
    const notesSource = technology.sources.find((source) => source.kind === "github-releases");
    const release = await db
      .from("releases")
      .insert({
        technology_id: technology.id,
        version: "1.0.0",
        significance: "featured",
        origin: "detected",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (release.error) throw release.error;
    const releaseId = z.object({ id: z.uuid() }).parse(release.data).id;
    const notes = await db
      .from("release_notes")
      .insert({ release_id: releaseId, source_id: notesSource?.id, body: "## Changes" });
    if (notes.error) throw notes.error;

    await sync([{ ...entry, sources: entry.sources.slice(0, 1) }]);

    expect((await readTechnology()).sources.map((source) => source.kind)).toEqual(["npm"]);
    const kept = await db.from("release_notes").select("source_id, body").eq("release_id", releaseId).single();
    expect(kept.data).toEqual({ source_id: null, body: "## Changes" });
  });

  it("retires a Technology whose file is gone, without deleting it", async () => {
    await sync([]);
    expect((await readTechnology()).retired).toBe(true);
  });

  it("brings the Technology back when its file returns", async () => {
    await sync([entry]);
    const technology = await readTechnology();
    expect(technology.retired).toBe(false);
    expect(technology.sources).toHaveLength(2);
  });
});
