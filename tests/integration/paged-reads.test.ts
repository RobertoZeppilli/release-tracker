import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { generateNotifications } from "@/modules/notifications/server";
import { collectSummaryBatches } from "@/modules/summaries/server";
import { PAGE_ROWS } from "@/lib/supabase-rows";
import { fakeSummaryBatches } from "./fake-summary-batches";
import { createDeveloper, deleteDeveloper, type Developer, serviceClient } from "./supabase";

// Issue #190: PostgREST answers a `select` with at most `max_rows` rows and says nothing about the
// ones it left out, so an unpaged read over a growing table is a lie that passes every test written
// under the thousand. These tests are the only ones that cross it: the seed is deliberately larger
// than the page, and each assertion is a count that an unpaged read cannot reach.
const ROWS = PAGE_ROWS + 200;

// PostgREST takes the whole seed in one request, but the `.in()` of the cleanup travels in the URL,
// so the ids go back in slices.
const SLICE = 200;

const IdRowSchema = z.array(z.object({ id: z.uuid() }));

let technologyId: string;
let releaseIds: string[];
let alice: Developer;

function slices<T>(items: readonly T[]): T[][] {
  const parts: T[][] = [];
  for (let start = 0; start < items.length; start += SLICE) parts.push(items.slice(start, start + SLICE));
  return parts;
}

// One Technology with more Releases than the page, each with a settled Summary, followed by one
// Developer: the shape in which every Release earns exactly one Notification.
beforeAll(async () => {
  const db = serviceClient();
  const slug = `paged-${randomUUID()}`;

  const technology = await db
    .from("technologies")
    .insert({ slug, name: slug, category: "library", classification_strategy: "semver" })
    .select("id")
    .single();
  if (technology.error) throw technology.error;
  technologyId = z.object({ id: z.uuid() }).parse(technology.data).id;

  const published = new Date().toISOString();
  releaseIds = [];
  for (const part of slices([...Array(ROWS).keys()])) {
    const inserted = await db
      .from("releases")
      .insert(
        part.map((index) => ({
          technology_id: technologyId,
          version: `0.0.${index}`,
          significance: "featured" as const,
          origin: "imported" as const,
          published_at: published,
        })),
      )
      .select("id");
    if (inserted.error) throw inserted.error;
    releaseIds.push(...IdRowSchema.parse(inserted.data).map((row) => row.id));
  }
  expect(releaseIds).toHaveLength(ROWS);

  // `unavailable` and not `ready`: it is settled, so a Notification is due (ADR 0009), and it needs
  // no provenance, which `summaries_ready_provenance` would demand of a `ready` row.
  for (const part of slices(releaseIds)) {
    const summaries = await db
      .from("summaries")
      .insert(part.map((releaseId) => ({ release_id: releaseId, status: "unavailable" })));
    if (summaries.error) throw summaries.error;
  }

  alice = await createDeveloper();
  const follow = await db.from("follows").insert({ user_id: alice.id, technology_id: technologyId });
  if (follow.error) throw follow.error;
}, 180_000);

afterAll(async () => {
  const db = serviceClient();
  // Before the Releases: a Notification points at one, and a Summary shares its primary key.
  const notifications = await db.from("notifications").delete().eq("user_id", alice.id);
  if (notifications.error) throw notifications.error;
  for (const part of slices(releaseIds)) {
    const summaries = await db.from("summaries").delete().in("release_id", part);
    if (summaries.error) throw summaries.error;
  }
  for (const [table, column] of [
    ["follows", "technology_id"],
    ["releases", "technology_id"],
    ["technologies", "id"],
  ] as const) {
    const { error } = await db.from(table).delete().eq(column, technologyId);
    if (error) throw error;
  }
  await deleteDeveloper(alice);
}, 180_000);

describe("a read that outgrew the page", () => {
  it("generateNotifications reaches the Release past the thousandth", async () => {
    const report = await generateNotifications(serviceClient());
    // Everything this run considered, the Catalogue of the machine it runs on included, so the floor
    // is what was seeded and not an equality.
    expect(report.considered).toBeGreaterThanOrEqual(ROWS);

    const { count, error } = await serviceClient()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", alice.id);
    if (error) throw error;
    // The whole point: unpaged this is PAGE_ROWS, and which Releases were left out depends on the
    // order of their random ids, so the one the Developer was waiting for is lost by chance.
    expect(count).toBe(ROWS);
  }, 180_000);

  it("collectSummaryBatches reaches the Summary past the thousandth", async () => {
    const db = serviceClient();
    const batchId = `msgbatch_fake_${randomUUID()}`;
    for (const part of slices(releaseIds)) {
      const { error } = await db
        .from("summaries")
        .update({ status: "processing", batch_id: batchId, updated_at: new Date().toISOString() })
        .in("release_id", part);
      if (error) throw error;
    }

    // A batch this fake never sent: `collect` answers "still processing", so nothing is written and
    // what the report counts is purely how many rows the read came back with.
    const batches = fakeSummaryBatches(() => ({ type: "succeeded", text: "{}" }));
    const report = await collectSummaryBatches(db, batches, { technologyIds: [technologyId] });
    expect(report.stillProcessing).toHaveLength(ROWS);
  }, 180_000);
});
