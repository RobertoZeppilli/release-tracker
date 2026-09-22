import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { CreditExhaustedError, MAX_NOTES_LENGTH, PROMPT_VERSION, SUMMARY_MODEL } from "@/modules/summaries";
import { collectSummaryBatches, submitPendingSummaries } from "@/modules/summaries/server";
import { fakeSummaryBatches, succeeded } from "./fake-summary-batches";
import { serviceClient } from "./supabase";

const content = {
  title: "Node 18 is dropped and the build gets faster.",
  keyPoints: ["Node 18 is no longer supported.", "Builds are faster.", "Preload is smarter."],
  breakingChanges: [{ change: "Node 18 is no longer supported", migration: "Upgrade to Node 20 or later." }],
  actionRequired: true,
};

const SummaryRowSchema = z.object({
  status: z.string(),
  content: z.unknown(),
  model: z.string().nullable(),
  prompt_version: z.string().nullable(),
  failure_reason: z.string().nullable(),
  batch_id: z.string().nullable(),
});

let technologyId: string;

beforeEach(async () => {
  const slug = `summaries-${randomUUID()}`;
  const inserted = await serviceClient()
    .from("technologies")
    .insert({ slug, name: "Summary test", classification_strategy: "semver" })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  technologyId = z.object({ id: z.uuid() }).parse(inserted.data).id;
});

afterEach(async () => {
  const db = serviceClient();
  const releases = await db.from("releases").select("id").eq("technology_id", technologyId);
  if (releases.error) throw releases.error;
  const ids = z.array(z.object({ id: z.uuid() })).parse(releases.data).map((row) => row.id);
  for (const table of ["summaries", "release_notes"] as const) {
    const { error } = await db.from(table).delete().in("release_id", ids);
    if (error) throw error;
  }
  for (const [table, column] of [["releases", "technology_id"], ["technologies", "id"]] as const) {
    const { error } = await db.from(table).delete().eq(column, technologyId);
    if (error) throw error;
  }
});

// A featured Release with notes and a pending Summary.
async function seedPending(version: string, notes = "### Breaking Changes\n\n* drop Node 18"): Promise<string> {
  const db = serviceClient();
  const release = await db
    .from("releases")
    .insert({ technology_id: technologyId, version, significance: "featured", origin: "detected", published_at: new Date().toISOString() })
    .select("id")
    .single();
  if (release.error) throw release.error;
  const releaseId = z.object({ id: z.uuid() }).parse(release.data).id;
  for (const [table, row] of [
    ["release_notes", { release_id: releaseId, body: notes }],
    ["summaries", { release_id: releaseId, status: "pending" }],
  ] as const) {
    const { error } = await db.from(table).insert(row);
    if (error) throw error;
  }
  return releaseId;
}

async function readSummary(releaseId: string) {
  const { data, error } = await serviceClient()
    .from("summaries")
    .select("status, content, model, prompt_version, failure_reason, batch_id")
    .eq("release_id", releaseId)
    .single();
  if (error) throw error;
  return SummaryRowSchema.parse(data);
}

describe("summaries pipeline", () => {
  it("takes each pending Release only once across concurrent runs", async () => {
    const seeded = await Promise.all(Array.from({ length: 20 }, (_, index) => seedPending(`1.${index}.0`)));
    const batches = fakeSummaryBatches(() => succeeded(content));

    await Promise.all([1, 2, 3].map(() => submitPendingSummaries(serviceClient(), batches)));

    const sent = batches.sent.flat().map((request) => request.releaseId).filter((id) => seeded.includes(id));
    expect(sent.toSorted()).toEqual(seeded.toSorted());
  });

  it("sends a batch, collects it later and stores a ready Summary with model and prompt version", async () => {
    const releaseId = await seedPending("2.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));

    const submitted = await submitPendingSummaries(serviceClient(), batches);
    expect(submitted.submitted).toContain(releaseId);
    expect(await readSummary(releaseId)).toMatchObject({ status: "processing", batch_id: submitted.batchId });

    batches.processing = true;
    expect((await collectSummaryBatches(serviceClient(), batches)).stillProcessing).toContain(releaseId);
    expect((await readSummary(releaseId)).status).toBe("processing");

    batches.processing = false;
    expect((await collectSummaryBatches(serviceClient(), batches)).ready).toContain(releaseId);
    expect(await readSummary(releaseId)).toMatchObject({
      status: "ready",
      content,
      model: SUMMARY_MODEL,
      prompt_version: PROMPT_VERSION,
      failure_reason: null,
    });
  });

  it("fails an invalid output with its reason", async () => {
    const releaseId = await seedPending("3.0.0");
    const batches = fakeSummaryBatches(() => succeeded({ ...content, title: "x".repeat(121) }));

    await submitPendingSummaries(serviceClient(), batches);
    await collectSummaryBatches(serviceClient(), batches);

    const summary = await readSummary(releaseId);
    expect(summary).toMatchObject({ status: "failed", content: null });
    expect(summary.failure_reason).toMatch(/invalid output[\s\S]*title/);
  });

  // Only an exhausted credit is reversible: a spent request is not retried (ADR 0007).
  it.each(["errored", "expired", "canceled"] as const)("fails a %s batch request with its reason", async (type) => {
    const releaseId = await seedPending(`3.1.0-${type}`);
    const batches = fakeSummaryBatches(() => ({ type, message: "invalid_request_error" }));

    await submitPendingSummaries(serviceClient(), batches);
    await collectSummaryBatches(serviceClient(), batches);

    expect(await readSummary(releaseId)).toMatchObject({
      status: "failed",
      failure_reason: `batch request ${type}: invalid_request_error`,
    });
  });

  it("fails notes over the threshold without sending them", async () => {
    const releaseId = await seedPending("4.0.0", "x".repeat(MAX_NOTES_LENGTH + 1));
    const batches = fakeSummaryBatches(() => succeeded(content));

    const report = await submitPendingSummaries(serviceClient(), batches);

    expect(report.failed).toContain(releaseId);
    expect(batches.sent.flat().map((request) => request.releaseId)).not.toContain(releaseId);
    expect((await readSummary(releaseId)).failure_reason).toMatch(/over the \d+ limit/);
  });

  it("keeps the Summaries pending when the credit is exhausted, without consuming the batch", async () => {
    const releaseId = await seedPending("6.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));
    batches.submit = async () => {
      throw new CreditExhaustedError();
    };

    const report = await submitPendingSummaries(serviceClient(), batches);

    expect(report).toMatchObject({ batchId: null, submitted: [], pending: [releaseId] });
    expect(await readSummary(releaseId)).toMatchObject({
      status: "pending",
      batch_id: null,
      model: null,
      prompt_version: null,
      failure_reason: null,
    });
  });

  it("queues the Summary again when the credit runs out inside the batch", async () => {
    const releaseId = await seedPending("6.1.0");
    const batches = fakeSummaryBatches(() => ({ type: "credit_exhausted", message: "credit balance is too low" }));

    await submitPendingSummaries(serviceClient(), batches);
    const report = await collectSummaryBatches(serviceClient(), batches);

    expect(report.pending).toContain(releaseId);
    expect(report.failed).not.toContain(releaseId);
    expect(await readSummary(releaseId)).toMatchObject({
      status: "pending",
      batch_id: null,
      failure_reason: null,
      content: null,
    });
  });

  it("summarises the queued Releases on the first run after the credit is topped up", async () => {
    const releaseId = await seedPending("6.2.0");
    const batches = fakeSummaryBatches(() => succeeded(content));
    const send = batches.submit;
    batches.submit = async () => {
      throw new CreditExhaustedError();
    };

    await submitPendingSummaries(serviceClient(), batches);
    batches.submit = send;
    expect((await submitPendingSummaries(serviceClient(), batches)).submitted).toContain(releaseId);
    expect((await collectSummaryBatches(serviceClient(), batches)).ready).toContain(releaseId);

    expect(await readSummary(releaseId)).toMatchObject({ status: "ready", content, failure_reason: null });
  });

  it("puts the Summaries back in the queue when the batch cannot be sent", async () => {
    const releaseId = await seedPending("5.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));
    batches.submit = async () => {
      throw new Error("network down");
    };

    await expect(submitPendingSummaries(serviceClient(), batches)).rejects.toThrow("network down");
    expect(await readSummary(releaseId)).toMatchObject({ status: "pending", batch_id: null });
  });
});
