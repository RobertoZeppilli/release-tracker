import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import type { StoredTechnology } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import type { SourceAdapters } from "@/modules/detection";
import { importTechnology, technologiesAwaitingImport } from "@/modules/detection/server";
import { serviceClient } from "./supabase";

const now = new Date("2026-09-22T12:00:00Z");

// A fake npm and GitHub Releases pair, counting the calls so the test can see they are not repeated.
const calls: string[] = [];
const adapters: SourceAdapters = {
  async listVersions(source) {
    calls.push(`versions ${source.package}`);
    return {
      etag: null,
      versions: [
        { version: "8.0.0", publishedAt: new Date("2026-03-12T10:00:00Z") },
        { version: "8.3.0", publishedAt: new Date("2026-09-10T11:25:16Z") },
        { version: "8.3.1", publishedAt: new Date("2026-09-15T09:00:00Z") },
        { version: "8.4.0-beta.0", publishedAt: new Date("2026-09-18T09:00:00Z") },
        { version: "8.4.0-alpha.0", publishedAt: new Date("2026-09-17T09:00:00Z") },
        { version: "7.3.0", publishedAt: new Date("2025-12-01T09:00:00Z") },
        { version: "6.0.0", publishedAt: new Date("2024-11-26T09:00:00Z") },
      ],
    };
  },
  async findNotes(source, versions) {
    calls.push(`notes ${source.repo}`);
    const notes = new Map([
      ["8.0.0", "### Breaking Changes\n\n* **deps:** drop Node 18\r\n"],
      ["8.3.0", "### Features\n\n* **build:** faster preload"],
      ["7.3.0", "### Features\n\n* older minor"],
    ]);
    return new Map(
      versions.flatMap((version) => {
        const body = notes.get(version);
        return body ? [[version, { body, url: `https://github.com/${source.repo}/releases/tag/v${version}` }]] : [];
      }),
    );
  },
};

const ImportedSchema = z.array(
  z.object({
    version: z.string(),
    significance: z.string(),
    origin: z.string(),
    published_at: z.string(),
    release_notes: z.object({ body: z.string(), url: z.string().nullable(), source_id: z.uuid().nullable() }).nullable(),
    summaries: z.object({ status: z.string() }).nullable(),
  }),
);

let technology: StoredTechnology;

async function readImported() {
  const { data, error } = await serviceClient()
    .from("releases")
    .select("version, significance, origin, published_at, release_notes (body, url, source_id), summaries (status)")
    .eq("technology_id", technology.id)
    .order("version");
  if (error) throw error;
  return ImportedSchema.parse(data);
}

beforeAll(async () => {
  const db = serviceClient();
  const slug = `import-${randomUUID()}`;
  const inserted = await db
    .from("technologies")
    .insert({ slug, name: "Import test", classification_strategy: "semver" })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  const technologyId = z.object({ id: z.uuid() }).parse(inserted.data).id;
  const sources = await db.from("sources").insert([
    { technology_id: technologyId, role: "detection", kind: "npm", config: { package: slug } },
    {
      technology_id: technologyId,
      role: "notes",
      kind: "github-releases",
      config: { repo: `test/${slug}`, tagFormat: "v{version}" },
    },
  ]);
  if (sources.error) throw sources.error;
  const stored = await getTechnology(db, slug);
  if (!stored) throw new Error("seeded Technology not found");
  technology = stored;
});

afterAll(async () => {
  const db = serviceClient();
  const releases = await db.from("releases").select("id").eq("technology_id", technology.id);
  const ids = z.array(z.object({ id: z.uuid() })).parse(releases.data).map((row) => row.id);
  await db.from("summaries").delete().in("release_id", ids);
  await db.from("release_notes").delete().in("release_id", ids);
  await db.from("releases").delete().eq("technology_id", technology.id);
  await db.from("sources").delete().eq("technology_id", technology.id);
  await db.from("technologies").delete().eq("id", technology.id);
});

describe("Initial Import", () => {
  it("waits for a Technology that has no Releases yet", async () => {
    const awaiting = await technologiesAwaitingImport(serviceClient());
    expect(awaiting.map((entry) => entry.id)).toContain(technology.id);
  });

  it("imports the last 12 months plus the latest featured Release, with notes as they are", async () => {
    await importTechnology(serviceClient(), technology, adapters, now);

    const notesSource = technology.sources.find((source) => source.role === "notes");
    expect(await readImported()).toEqual([
      {
        version: "7.3.0",
        significance: "notable",
        origin: "imported",
        published_at: "2025-12-01T09:00:00+00:00",
        release_notes: {
          body: "### Features\n\n* older minor",
          url: `https://github.com/test/${technology.slug}/releases/tag/v7.3.0`,
          source_id: notesSource?.id,
        },
        summaries: { status: "skipped" },
      },
      expect.objectContaining({ version: "8.0.0", significance: "featured", summaries: { status: "pending" } }),
      expect.objectContaining({ version: "8.3.0", significance: "notable", summaries: { status: "pending" } }),
      expect.objectContaining({ version: "8.3.1", significance: "digest", summaries: { status: "unavailable" } }),
      expect.objectContaining({
        version: "8.4.0-beta.0",
        significance: "preview",
        release_notes: null,
        summaries: { status: "unavailable" },
      }),
    ]);
    const featured = (await readImported()).find((release) => release.version === "8.0.0");
    expect(featured?.release_notes?.body).toBe("### Breaking Changes\n\n* **deps:** drop Node 18\r\n");
  });

  it("no longer waits for the Technology once it has Releases", async () => {
    const awaiting = await technologiesAwaitingImport(serviceClient());
    expect(awaiting.map((entry) => entry.id)).not.toContain(technology.id);
  });

  it("creates no duplicates when run again", async () => {
    const before = await readImported();
    await importTechnology(serviceClient(), technology, adapters, now);
    expect(await readImported()).toEqual(before);
  });
});
