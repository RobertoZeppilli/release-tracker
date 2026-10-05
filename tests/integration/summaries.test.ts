import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { publicPagesFor } from "@/modules/releases";
import { CreditExhaustedError, MAX_NOTES_LENGTH, PROMPT_VERSION, SUMMARY_MODEL } from "@/modules/summaries";
import { collectSummaryBatches, submitPendingSummaries } from "@/modules/summaries/server";
import { type FakeSummaryBatches, fakeSummaryBatches, succeeded } from "./fake-summary-batches";
import { serviceClient } from "./supabase";

const content = {
  title: "Node 18 is dropped and the build gets faster.",
  keyPoints: [
    { text: "Node 18 is no longer supported.", quote: "drop Node 18" },
    { text: "Builds are faster." },
    { text: "Preload is smarter." },
  ],
  breakingChanges: [
    { change: "Node 18 is no longer supported", migration: "Upgrade to Node 20 or later.", quote: "drop Node 18" },
  ],
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
let slug: string;

// Both jobs reach every Summary in the database, and a developer's database holds the whole Catalog:
// unfenced, one run of these tests would send every real pending Summary to a fake batch that nobody
// will ever collect (issue #55). Each call here stays inside the Technology the test seeded.
function submit(batches: FakeSummaryBatches, options: { maxCount?: number } = {}) {
  return submitPendingSummaries(serviceClient(), batches, { ...options, technologyIds: [technologyId] });
}

function collect(batches: FakeSummaryBatches) {
  return collectSummaryBatches(serviceClient(), batches, { technologyIds: [technologyId] });
}

// Every Technology this test created, so the cleanup takes the outsiders of the fence test too.
let created: string[] = [];

async function seedTechnology(technologySlug: string): Promise<string> {
  const inserted = await serviceClient()
    .from("technologies")
    .insert({ slug: technologySlug, name: "Summary test", classification_strategy: "semver" })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  const id = z.object({ id: z.uuid() }).parse(inserted.data).id;
  created.push(id);
  return id;
}

beforeEach(async () => {
  created = [];
  slug = `summaries-${randomUUID()}`;
  technologyId = await seedTechnology(slug);
});

afterEach(async () => {
  const db = serviceClient();
  const releases = await db.from("releases").select("id").in("technology_id", created);
  if (releases.error) throw releases.error;
  const ids = z.array(z.object({ id: z.uuid() })).parse(releases.data).map((row) => row.id);
  for (const table of ["summaries", "release_notes"] as const) {
    const { error } = await db.from(table).delete().in("release_id", ids);
    if (error) throw error;
  }
  for (const [table, column] of [["releases", "technology_id"], ["technologies", "id"]] as const) {
    const { error } = await db.from(table).delete().in(column, created);
    if (error) throw error;
  }
});

// A featured Release with notes and a pending Summary.
async function seedPending(
  version: string,
  notes = "### Breaking Changes\n\n* drop Node 18",
  technology = technologyId,
): Promise<string> {
  const db = serviceClient();
  const release = await db
    .from("releases")
    .insert({ technology_id: technology, version, significance: "featured", origin: "detected", published_at: new Date().toISOString() })
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

// A Summary left in flight by another run: the batch is not one this test's fake knows.
async function setProcessing(releaseId: string, batchId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("summaries")
    .update({ status: "processing", batch_id: batchId })
    .eq("release_id", releaseId);
  if (error) throw error;
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

    await Promise.all([1, 2, 3].map(() => submit(batches)));

    const sent = batches.sent.flat().map((request) => request.releaseId).filter((id) => seeded.includes(id));
    expect(sent.toSorted()).toEqual(seeded.toSorted());
  });

  it("sends a batch, collects it later and stores a ready Summary with model and prompt version", async () => {
    const releaseId = await seedPending("2.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));

    const submitted = await submit(batches);
    expect(submitted.submitted).toContain(releaseId);
    expect(await readSummary(releaseId)).toMatchObject({ status: "processing", batch_id: submitted.batchId });

    batches.processing = true;
    expect((await collect(batches)).stillProcessing).toContain(releaseId);
    expect((await readSummary(releaseId)).status).toBe("processing");

    batches.processing = false;
    expect((await collect(batches)).ready).toContain(releaseId);
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
    const batches = fakeSummaryBatches(() => succeeded({ ...content, title: "x".repeat(141) }));

    await submit(batches);
    await collect(batches);

    const summary = await readSummary(releaseId);
    expect(summary).toMatchObject({ status: "failed", content: null });
    expect(summary.failure_reason).toMatch(/invalid output[\s\S]*title/);
  });

  // Only an exhausted credit is reversible: a spent request is not retried (ADR 0007).
  it.each(["errored", "expired", "canceled"] as const)("fails a %s batch request with its reason", async (type) => {
    const releaseId = await seedPending(`3.1.0-${type}`);
    const batches = fakeSummaryBatches(() => ({ type, message: "invalid_request_error" }));

    await submit(batches);
    await collect(batches);

    expect(await readSummary(releaseId)).toMatchObject({
      status: "failed",
      failure_reason: `batch request ${type}: invalid_request_error`,
    });
  });

  it("fails notes over the threshold without sending them", async () => {
    const releaseId = await seedPending("4.0.0", "x".repeat(MAX_NOTES_LENGTH + 1));
    const batches = fakeSummaryBatches(() => succeeded(content));

    const report = await submit(batches);

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

    const report = await submit(batches);

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

    await submit(batches);
    const report = await collect(batches);

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

    await submit(batches);
    batches.submit = send;
    expect((await submit(batches)).submitted).toContain(releaseId);
    expect((await collect(batches)).ready).toContain(releaseId);

    expect(await readSummary(releaseId)).toMatchObject({ status: "ready", content, failure_reason: null });
  });

  it("names the pages of every settled Release, so the job can revalidate them", async () => {
    const releaseId = await seedPending("7.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));

    await submit(batches);
    batches.processing = true;
    const processing = await collect(batches);
    expect(processing.changed).not.toContainEqual({ slug, version: "7.0.0" });

    batches.processing = false;
    const report = await collect(batches);

    expect(report.ready).toContain(releaseId);
    expect(report.changed).toContainEqual({ slug, version: "7.0.0" });
    expect(publicPagesFor(report.changed)).toEqual(
      expect.arrayContaining([`/technologies/${slug}`, `/technologies/${slug}/7.0.0`]),
    );
  });

  it("names the page of a Release put back in the queue: its status block changed too", async () => {
    await seedPending("7.1.0");
    const batches = fakeSummaryBatches(() => ({ type: "credit_exhausted", message: "credit balance is too low" }));

    await submit(batches);

    expect((await collect(batches)).changed).toContainEqual({ slug, version: "7.1.0" });
  });

  it("puts the Summaries back in the queue when the batch cannot be sent", async () => {
    const releaseId = await seedPending("5.0.0");
    const batches = fakeSummaryBatches(() => succeeded(content));
    batches.submit = async () => {
      throw new Error("network down");
    };

    await expect(submit(batches)).rejects.toThrow("network down");
    expect(await readSummary(releaseId)).toMatchObject({ status: "pending", batch_id: null });
  });

  // The fence of issue #55: unfenced, both jobs would reach the Summaries of the whole Catalog.
  it("leaves the Summaries of another Technology alone", async () => {
    const outsider = await seedTechnology(`summaries-outsider-${randomUUID()}`);
    const queued = await seedPending("8.0.0", undefined, outsider);
    const inFlight = await seedPending("8.1.0", undefined, outsider);
    await setProcessing(inFlight, "msgbatch_elsewhere");
    const mine = await seedPending("8.2.0");
    const batches = fakeSummaryBatches(() => succeeded(content));

    const submitted = await submit(batches);
    const collected = await collect(batches);

    expect(submitted.submitted).toEqual([mine]);
    expect(collected.ready).toEqual([mine]);
    expect(await readSummary(queued)).toMatchObject({ status: "pending", batch_id: null, model: null });
    expect(await readSummary(inFlight)).toMatchObject({ status: "processing", batch_id: "msgbatch_elsewhere" });
  });
});

// Issue #88: a Summary that renders as a real one must say where it came from. The pipeline above is
// the only writer that reaches `ready`, so these tests go straight at the table, the way a hand
// written row would.
describe("the provenance of a ready Summary", () => {
  async function setSummary(releaseId: string, row: Record<string, unknown>) {
    return serviceClient().from("summaries").update(row).eq("release_id", releaseId);
  }

  it.each([
    ["model", { status: "ready", content, prompt_version: PROMPT_VERSION }],
    ["prompt version", { status: "ready", content, model: SUMMARY_MODEL }],
    ["content", { status: "ready", model: SUMMARY_MODEL, prompt_version: PROMPT_VERSION }],
  ])("is refused by the database without the %s", async (_what, row) => {
    const releaseId = await seedPending("9.0.0");

    const { error } = await setSummary(releaseId, row);

    expect(error?.message).toMatch(/summaries_ready_provenance/);
    expect((await readSummary(releaseId)).status).toBe("pending");
  });

  // Every status before `ready` stands for a Summary nobody is shown: provenance it has not got yet.
  it.each(["pending", "processing", "failed", "unavailable", "skipped"] as const)(
    "leaves a %s Summary without provenance alone",
    async (status) => {
      const releaseId = await seedPending(`9.1.0-${status}`);

      const { error } = await setSummary(releaseId, { status, model: null, prompt_version: null });

      expect(error).toBeNull();
      expect(await readSummary(releaseId)).toMatchObject({ status, model: null, prompt_version: null });
    },
  );
});
