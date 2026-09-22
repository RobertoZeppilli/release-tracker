import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anonClient, type Content, deleteContent, seedContent, serviceClient } from "./supabase";

const PERMISSION_DENIED = "42501";
const UNIQUE_VIOLATION = "23505";

let content: Content;

beforeAll(async () => {
  content = await seedContent();
});

afterAll(async () => {
  await deleteContent(content);
});

describe("public content", () => {
  it("is readable by anon", async () => {
    const anon = anonClient();
    const reads = await Promise.all([
      anon.from("technologies").select("id").eq("id", content.technologyId),
      anon.from("releases").select("id").eq("id", content.releaseId),
      anon.from("release_notes").select("release_id").eq("release_id", content.releaseId),
      anon.from("summaries").select("release_id").eq("release_id", content.releaseId),
    ]);
    for (const { data, error } of reads) {
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    }
  });

  it("is not writable by anon", async () => {
    const anon = anonClient();
    const writes = await Promise.all([
      anon.from("technologies").insert({ slug: "anon", name: "anon", classification_strategy: "semver" }),
      anon.from("technologies").update({ name: "changed" }).eq("id", content.technologyId),
      anon.from("releases").update({ significance: "digest" }).eq("id", content.releaseId),
      anon.from("release_notes").update({ body: "changed" }).eq("release_id", content.releaseId),
      anon.from("summaries").update({ status: "ready" }).eq("release_id", content.releaseId),
      anon.from("summaries").delete().eq("release_id", content.releaseId),
    ]);
    for (const { error } of writes) {
      expect(error?.code).toBe(PERMISSION_DENIED);
    }
  });

  it("is writable by the service role", async () => {
    const { error } = await serviceClient()
      .from("summaries")
      .update({ status: "processing" })
      .eq("release_id", content.releaseId);
    expect(error).toBeNull();
  });

  it("allows one Release per Technology and Version", async () => {
    const { error } = await serviceClient().from("releases").insert({
      technology_id: content.technologyId,
      version: "1.0.0",
      significance: "notable",
      origin: "detected",
      published_at: new Date().toISOString(),
    });
    expect(error?.code).toBe(UNIQUE_VIOLATION);
  });
});
