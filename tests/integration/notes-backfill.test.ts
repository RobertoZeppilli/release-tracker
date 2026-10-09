import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import type { StoredTechnology } from "@/modules/catalog";
import { getTechnology } from "@/modules/catalog/server";
import type { SourceAdapters } from "@/modules/detection";
import { backfillNotes } from "@/modules/detection/server";
import { serviceClient } from "./supabase";

// What the Source has learned to find since these Releases were imported. `2.0.1` is the Release the
// Source has nothing for: it stands for the `v7.0-rc` of TypeScript, a tag nobody ever published.
const available = new Map([
  ["2.0.0", "### Features\n\n* **api:** a late arrival"],
  ["3.0.0-rc.0", "### Breaking Changes\n\n* **node:** drop 20"],
]);

const asked: string[][] = [];
const adapters: SourceAdapters = {
  async listVersions() {
    throw new Error("the backfill must not ask for Versions");
  },
  async findNotes(source, versions) {
    asked.push([...versions].sort());
    return new Map(
      versions.flatMap((version) => {
        const body = available.get(version);
        return body ? [[version, { body, url: `https://github.com/${source.repo}/releases/tag/v${version}` }]] : [];
      }),
    );
  },
};

const StateSchema = z.array(
  z.object({
    version: z.string(),
    release_notes: z.object({ body: z.string(), source_id: z.uuid().nullable() }).nullable(),
    summaries: z.object({ status: z.string(), content: z.unknown() }).nullable(),
  }),
);

let technology: StoredTechnology;
let bare: StoredTechnology;

async function readState(technologyId: string) {
  const { data, error } = await serviceClient()
    .from("releases")
    .select("version, release_notes (body, source_id), summaries (status, content)")
    .eq("technology_id", technologyId)
    .order("version");
  if (error) throw error;
  return StateSchema.parse(data);
}

async function seedTechnology(prefix: string, withNotesSource: boolean) {
  const db = serviceClient();
  const slug = `${prefix}-${randomUUID()}`;
  const inserted = await db
    .from("technologies")
    .insert({ slug, name: "Backfill test", category: "library", classification_strategy: "semver" })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  const technologyId = z.object({ id: z.uuid() }).parse(inserted.data).id;

  type SourceRow = { technology_id: string; role: string; kind: string; config: Record<string, string> };
  const sources: SourceRow[] = [{ technology_id: technologyId, role: "detection", kind: "npm", config: { package: slug } }];
  if (withNotesSource) {
    sources.push({
      technology_id: technologyId,
      role: "notes",
      kind: "github-releases",
      config: { repo: `test/${slug}`, tagFormat: "v{version}" },
    });
  }
  const written = await db.from("sources").insert(sources);
  if (written.error) throw written.error;

  const stored = await getTechnology(db, slug);
  if (!stored) throw new Error("seeded Technology not found");
  return stored;
}

async function seedRelease(
  technologyId: string,
  version: string,
  significance: string,
  summary: { status: string; content?: unknown; model?: string; promptVersion?: string },
  notes?: string,
) {
  const db = serviceClient();
  const inserted = await db
    .from("releases")
    .insert({
      technology_id: technologyId,
      version,
      significance,
      origin: "imported",
      published_at: "2026-02-01T09:00:00Z",
    })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  const releaseId = z.object({ id: z.uuid() }).parse(inserted.data).id;

  const written = await db.from("summaries").insert({
    release_id: releaseId,
    status: summary.status,
    content: summary.content ?? null,
    model: summary.model ?? null,
    prompt_version: summary.promptVersion ?? null,
  });
  if (written.error) throw written.error;
  if (notes !== undefined) {
    const stored = await db.from("release_notes").insert({ release_id: releaseId, body: notes });
    if (stored.error) throw stored.error;
  }
}

beforeAll(async () => {
  technology = await seedTechnology("backfill", true);
  bare = await seedTechnology("backfill-bare", false);
  // Already complete, and already summarized: the run must leave both alone.
  await seedRelease(
    technology.id,
    "1.0.0",
    "featured",
    { status: "ready", content: { title: "A ready Summary" }, model: "claude-haiku-5-5", promptVersion: "v7" },
    "### Features\n\n* the notes it was born with",
  );
  await seedRelease(technology.id, "2.0.0", "notable", { status: "unavailable" });
  await seedRelease(technology.id, "2.0.1", "digest", { status: "unavailable" });
  await seedRelease(technology.id, "3.0.0-rc.0", "preview", { status: "unavailable" });
  await seedRelease(bare.id, "9.9.9", "notable", { status: "unavailable" });
});

afterAll(async () => {
  const db = serviceClient();
  for (const seeded of [technology, bare]) {
    const releases = await db.from("releases").select("id").eq("technology_id", seeded.id);
    const ids = z.array(z.object({ id: z.uuid() })).parse(releases.data).map((row) => row.id);
    await db.from("summaries").delete().in("release_id", ids);
    await db.from("release_notes").delete().in("release_id", ids);
    await db.from("releases").delete().eq("technology_id", seeded.id);
    await db.from("sources").delete().eq("technology_id", seeded.id);
    await db.from("technologies").delete().eq("id", seeded.id);
  }
});

describe("Ripresa delle Note di rilascio", () => {
  it("asks the Sources only for the Releases without notes, and writes nothing on a dry run", async () => {
    const before = await readState(technology.id);
    const report = await backfillNotes(serviceClient(), adapters, { slug: technology.slug, apply: false });

    expect(asked).toEqual([["2.0.0", "2.0.1", "3.0.0-rc.0"]]);
    expect(report.applied).toBe(false);
    expect(report.missing).toBe(3);
    expect(report.filled.map(({ version }) => version)).toEqual(["2.0.0", "3.0.0-rc.0"]);
    expect(report.remaining).toEqual([{ slug: technology.slug, version: "2.0.1", reason: "not at the source" }]);
    expect(report.settled).toBe(0);
    expect(await readState(technology.id)).toEqual(before);
  });

  it("fills the missing notes and settles their Summary as skipped, never as pending", async () => {
    const report = await backfillNotes(serviceClient(), adapters, { slug: technology.slug, apply: true });

    expect(report.applied).toBe(true);
    expect(report.settled).toBe(2);
    expect(report.failed).toEqual([]);
    const notesSource = technology.sources.find((source) => source.role === "notes");
    expect(await readState(technology.id)).toEqual([
      {
        version: "1.0.0",
        release_notes: { body: "### Features\n\n* the notes it was born with", source_id: null },
        summaries: { status: "ready", content: { title: "A ready Summary" } },
      },
      {
        version: "2.0.0",
        release_notes: { body: "### Features\n\n* **api:** a late arrival", source_id: notesSource?.id },
        summaries: { status: "skipped", content: null },
      },
      { version: "2.0.1", release_notes: null, summaries: { status: "unavailable", content: null } },
      {
        version: "3.0.0-rc.0",
        release_notes: { body: "### Breaking Changes\n\n* **node:** drop 20", source_id: notesSource?.id },
        summaries: { status: "skipped", content: null },
      },
    ]);
  });

  it("asks only for what is still missing when it runs again", async () => {
    asked.length = 0;
    const report = await backfillNotes(serviceClient(), adapters, { slug: technology.slug, apply: true });

    expect(asked).toEqual([["2.0.1"]]);
    expect(report.missing).toBe(1);
    expect(report.filled).toEqual([]);
    expect(report.settled).toBe(0);
  });

  it("says why a Technology without a notes Source is left as it is, without asking anybody", async () => {
    asked.length = 0;
    const report = await backfillNotes(serviceClient(), adapters, { slug: bare.slug, apply: true });

    expect(asked).toEqual([]);
    expect(report.asked).toBe(0);
    expect(report.remaining).toEqual([{ slug: bare.slug, version: "9.9.9", reason: "no notes source" }]);
  });
});
