import type Anthropic from "@anthropic-ai/sdk";
import { APIError } from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  CreditExhaustedError,
  type SummaryBatches,
  type SummaryRequest,
  type SummaryResult,
} from "../domain/summary-batches";
import { SummaryContentSchema } from "../domain/summary-content";

// A Summary is a small JSON object, but the model thinks before writing it and thinking counts here.
const MAX_TOKENS = 8_000;
// Reading release notes and quoting them back is extraction, not research: `high` buys nothing.
const EFFORT = "medium";
// The answer is decoded against the Summary's own schema, so it cannot come back as prose or inside
// a markdown fence. Lengths and counts survive only as hints: `parseSummaryOutput` still validates.
const FORMAT = zodOutputFormat(SummaryContentSchema);

type BatchRequest = Anthropic.Messages.Batches.BatchCreateParams["requests"][number];

// Only what the adapter reads of a batch result: the SDK's own types are assignable to these,
// which `createSummaryBatches` proves, so the tests can answer with plain objects.
type BatchError = { error: { error: { type: string; message: string } } };
type BatchMessage = {
  content: readonly { type: string }[];
  stop_reason: string | null;
  usage?: { input_tokens: number; output_tokens: number };
};
export type BatchResult =
  | ({ type: "errored" } & BatchError)
  | { type: "succeeded"; message: BatchMessage }
  | { type: "expired" }
  | { type: "canceled" };

export type BatchesClient = {
  create(body: { requests: BatchRequest[] }): Promise<{ id: string }>;
  retrieve(batchId: string): Promise<{ processing_status: string }>;
  results(batchId: string): Promise<AsyncIterable<{ custom_id: string; result: BatchResult }>>;
};

// The real Message Batches API behind the `SummaryBatches` port (ADR 0007), same contract as the fake.
export function anthropicSummaryBatches(batches: BatchesClient): SummaryBatches {
  return {
    async submit(requests) {
      try {
        const batch = await batches.create({ requests: requests.map(toBatchRequest) });
        return batch.id;
      } catch (error) {
        if (isBillingError(error)) throw new CreditExhaustedError(error.message);
        throw error;
      }
    },
    async collect(batchId) {
      const batch = await batches.retrieve(batchId);
      if (batch.processing_status !== "ended") return null;
      const results = new Map<string, SummaryResult>();
      for await (const response of await batches.results(batchId)) {
        results.set(response.custom_id, toSummaryResult(response.result));
      }
      return results;
    },
  };
}

function toBatchRequest(request: SummaryRequest): BatchRequest {
  return {
    custom_id: request.releaseId,
    params: {
      model: request.model,
      max_tokens: MAX_TOKENS,
      output_config: { effort: EFFORT, format: FORMAT },
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
    },
  };
}

function toSummaryResult(result: BatchResult): SummaryResult {
  switch (result.type) {
    case "succeeded":
      return succeededResult(result.message);
    case "errored":
      // A batch accepted while there was credit can still run out of it halfway through.
      return result.error.error.type === "billing_error"
        ? { type: "credit_exhausted", message: result.error.error.message }
        : { type: "errored", message: `${result.error.error.type}: ${result.error.error.message}` };
    case "expired":
      return { type: "expired", message: "the batch request expired before it ran" };
    case "canceled":
      return { type: "canceled", message: "the batch was canceled" };
  }
}

function succeededResult(message: BatchMessage): SummaryResult {
  // A refusal or a cut-off answer is not a Summary: the text would be partial JSON at best.
  if (message.stop_reason === "refusal") return { type: "errored", message: "the model refused to answer" };
  if (message.stop_reason === "max_tokens") {
    return { type: "errored", message: `the answer hit the ${MAX_TOKENS} token limit` };
  }
  const text = message.content.map(blockText).join("");
  if (text.trim() === "") return { type: "errored", message: "the model answered without any text" };
  const usage = message.usage;
  if (usage === undefined) return { type: "succeeded", text };
  return { type: "succeeded", text, usage: { inputTokens: usage.input_tokens, outputTokens: usage.output_tokens } };
}

function blockText(block: { type: string }): string {
  return block.type === "text" && "text" in block && typeof block.text === "string" ? block.text : "";
}

// 402 is the credit balance; the API also refuses with a 400 whose message names it.
function isBillingError(error: unknown): error is APIError {
  if (!(error instanceof APIError)) return false;
  return error.status === 402 || /credit balance/i.test(error.message);
}
