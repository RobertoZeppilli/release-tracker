import { z } from "zod";
import { type SummaryContent, SummaryContentSchema } from "./summary-content";

export type ParsedOutput = { ok: true; content: SummaryContent } | { ok: false; reason: string };

// The model's text becomes a Summary only if it validates; otherwise the reason is stored with `failed`.
export function parseSummaryOutput(text: string): ParsedOutput {
  let json: unknown;
  try {
    json = JSON.parse(withoutCodeFence(text));
  } catch {
    return { ok: false, reason: "invalid output: not JSON" };
  }
  const result = SummaryContentSchema.safeParse(json);
  if (!result.success) return { ok: false, reason: `invalid output:\n${z.prettifyError(result.error)}` };
  return { ok: true, content: result.data };
}

// Asked for JSON, a model sometimes answers with a markdown code block. The content is there:
// the fence alone is not worth failing a Summary that has been paid for.
function withoutCodeFence(text: string): string {
  const fenced = /^```[a-z]*\r?\n([\s\S]*)\r?\n```$/.exec(text.trim());
  return fenced?.[1] ?? text;
}
