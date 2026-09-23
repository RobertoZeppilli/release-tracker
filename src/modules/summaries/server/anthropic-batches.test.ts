import { APIError } from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { CreditExhaustedError, type SummaryRequest } from "../domain/summary-batches";
import { anthropicSummaryBatches, type BatchesClient, type BatchResult } from "./anthropic-batches";

type Individual = { custom_id: string; result: BatchResult };

const request: SummaryRequest = { releaseId: "rel-1", model: "claude-opus-5", system: "s", prompt: "p" };

const answered = { type: "text", text: '{"title":"ok"}' };

// A client that answers with the results it is given, so the adapter is the only thing under test.
function client(results: Individual[], status = "ended") {
  const created: unknown[] = [];
  const batches: BatchesClient & { created: unknown[] } = {
    created,
    async create(body) {
      created.push(...body.requests);
      return { id: "msgbatch_1" };
    },
    async retrieve() {
      return { processing_status: status };
    },
    async results() {
      return (async function* () {
        yield* results;
      })();
    },
  };
  return batches;
}

function one(result: BatchResult): Individual[] {
  return [{ custom_id: "rel-1", result }];
}

function errored(type: string, message: string): Individual[] {
  return one({ type: "errored", error: { error: { type, message } } });
}

function answeredWith(stop_reason: string | null, content: { type: string }[] = [answered]): Individual[] {
  return one({ type: "succeeded", message: { stop_reason, content } });
}

async function collectOne(results: Individual[], status = "ended") {
  const collected = await anthropicSummaryBatches(client(results, status)).collect("msgbatch_1");
  return collected === null ? null : collected.get("rel-1");
}

describe("anthropicSummaryBatches", () => {
  it("sends one request per Release, keyed by its id", async () => {
    const batches = client([]);
    const id = await anthropicSummaryBatches(batches).submit([request]);

    expect(id).toBe("msgbatch_1");
    expect(batches.created).toEqual([
      expect.objectContaining({
        custom_id: "rel-1",
        params: expect.objectContaining({ model: "claude-opus-5", system: "s" }),
      }),
    ]);
  });

  it("turns a billing error on submit into CreditExhaustedError", async () => {
    const batches = client([]);
    batches.create = () => {
      throw new APIError(402, { type: "error", error: { type: "billing_error", message: "low" } }, "low", undefined);
    };

    await expect(anthropicSummaryBatches(batches).submit([request])).rejects.toBeInstanceOf(CreditExhaustedError);
  });

  it("reports a batch that is still running as null", async () => {
    expect(await collectOne([], "in_progress")).toBeNull();
  });

  it("returns the text of a succeeded request", async () => {
    expect(await collectOne(answeredWith("end_turn"))).toEqual({ type: "succeeded", text: '{"title":"ok"}' });
  });

  it("reads a billing error inside the batch as an exhausted credit", async () => {
    expect(await collectOne(errored("billing_error", "low"))).toEqual({ type: "credit_exhausted", message: "low" });
  });

  it("reads any other error in the batch as a failure", async () => {
    expect(await collectOne(errored("api_error", "boom"))).toMatchObject({ type: "errored" });
  });

  it("refuses an answer cut off by the token limit", async () => {
    expect(await collectOne(answeredWith("max_tokens"))).toMatchObject({ type: "errored" });
  });

  it("refuses an answer the model declined to give", async () => {
    expect(await collectOne(answeredWith("refusal"))).toMatchObject({ type: "errored" });
  });

  it("refuses an answer with no text at all", async () => {
    expect(await collectOne(answeredWith("end_turn", [{ type: "thinking" }]))).toMatchObject({ type: "errored" });
  });

  it("reads an expired request as expired", async () => {
    expect(await collectOne(one({ type: "expired" }))).toMatchObject({ type: "expired" });
  });
});
