import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import { noteLines } from "@/modules/releases";
import {
  evaluateSummary,
  type ExpectedSummary,
  parseSummaryOutput,
  prepareSummaryRequest,
  PROMPT_VERSION,
  SUMMARY_MODEL,
  type SummaryContent,
  type SummaryEvaluation,
  type SummaryResult,
  type SummaryUsage,
} from "@/modules/summaries";
import { createSummaryBatches } from "@/modules/summaries/server";

// A batch to score, whether it was just paid for or read back from the file a run left behind.
type Replayable = { batchId: string; results: Map<string, SummaryResult>; startedAt: Date };

// The evaluation set of issue #14: every case through the real Message Batches API in one batch,
// compared against what a human said the Summary must say. Costs a few tens of cents a run.
// `pnpm summary:eval` · `pnpm summary:eval --dry` prints the set without calling Anthropic.
// `--model <id>` runs the set on another model than the one the app uses, which is how two
// models are compared on the same prompt (#57): the report keeps the model in its name, so the
// runs sit side by side in `reports/`.
// `--results <file>` scores a batch that has already been paid for, from the `.results.json` every
// run saves beside its report, instead of submitting a new one. What the model answered does not
// change when our schema does, and a fix to the schema is not worth a second batch (#93).
const SET_DIR = "eval/summaries";
const dry = process.argv.includes("--dry");
const replayFile = process.argv.includes("--results") ? (process.argv[process.argv.indexOf("--results") + 1] ?? "") : null;
if (replayFile === "") throw new Error("--results wants the path of a saved results file");
const modelArgument = process.argv[process.argv.indexOf("--model") + 1];
const model = process.argv.includes("--model") ? (modelArgument ?? "") : SUMMARY_MODEL;
if (!model.startsWith("claude-")) throw new Error(`--model wants a model id, got ${JSON.stringify(modelArgument)}`);

const ExpectedBreakingChangeSchema = z.object({
  id: z.string(),
  about: z.string(),
  match: z.array(z.string()).min(1),
});
const CaseSchema = z.object({
  slug: z.string(),
  version: z.string(),
  technologyName: z.string(),
  notes: z.string(),
  note: z.string(),
  expected: z.object({
    actionRequired: z.union([z.boolean(), z.literal("either")]),
    notesJudgeable: z.union([z.boolean(), z.literal("either")]),
    breakingChanges: z.array(ExpectedBreakingChangeSchema),
    allowed: z.array(ExpectedBreakingChangeSchema).optional(),
  }),
});
const SetSchema = z.object({ cases: z.array(CaseSchema).min(1) });

const set = SetSchema.parse(JSON.parse(await readFile(join(SET_DIR, "set.json"), "utf8")));
const cases = await Promise.all(
  // The same reading of the notes the Release page does, so the model and the comparison see the
  // text the reader sees, line endings included.
  set.cases.map(async (item) => ({
    ...item,
    text: noteLines(await readFile(join(SET_DIR, item.notes), "utf8")).join("\n"),
  })),
);

// The custom id of a batch request is limited to letters, digits, `_` and `-`.
const idOf = (slug: string, version: string): string => `${slug}-${version}`.replaceAll(/[^A-Za-z0-9_-]/g, "_");

const requests = cases.map((item) => {
  const prepared = prepareSummaryRequest({
    releaseId: idOf(item.slug, item.version),
    technologyName: item.technologyName,
    version: item.version,
    notes: item.text,
  });
  if (!prepared.ok) throw new Error(`${item.slug} ${item.version}: ${prepared.reason}`);
  return { ...prepared.request, model };
});

const characters = cases.reduce((total, item) => total + item.text.length, 0);
console.log(`${cases.length} cases, ${characters} characters of notes, prompt ${PROMPT_VERSION}, model ${model}`);
if (dry) {
  for (const item of cases) console.log(`  ${item.slug} ${item.version}: ${item.text.length} characters — ${item.note}`);
  process.exit(0);
}

// A saved result is decoded, not trusted: the file comes back from the disk like anything else.
const SavedResultSchema: z.ZodType<SummaryResult> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("succeeded"),
    text: z.string(),
    usage: z.object({ inputTokens: z.number(), outputTokens: z.number() }).optional(),
  }),
  z.object({ type: z.enum(["errored", "expired", "canceled", "credit_exhausted"]), message: z.string() }),
]);

const SavedResultsSchema = z.object({
  batchId: z.string(),
  results: z.record(z.string(), SavedResultSchema),
});

const { batchId, results, startedAt, replayed } = replayFile === null ? await run() : await replay(replayFile);

async function run(): Promise<Replayable & { replayed: false }> {
  const env = z.object({ ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-") }).parse(process.env);
  const batches = createSummaryBatches(env.ANTHROPIC_API_KEY);
  if (batches === null) throw new Error("no ANTHROPIC_API_KEY in the environment");

  const startedAt = new Date();
  const id = await batches.submit(requests);
  console.log(`batch ${id}, waiting (batches usually take minutes)`);

  const deadline = Date.now() + 60 * 60 * 1000;
  let collected = await batches.collect(id);
  while (collected === null) {
    if (Date.now() > deadline) throw new Error(`batch ${id} is still running after an hour`);
    await new Promise((resolve) => setTimeout(resolve, 20_000));
    process.stdout.write(".");
    collected = await batches.collect(id);
  }
  console.log("");
  return { batchId: id, results: collected, startedAt, replayed: false };
}

async function replay(file: string): Promise<Replayable & { replayed: true }> {
  const saved = SavedResultsSchema.parse(JSON.parse(await readFile(file, "utf8")));
  console.log(`replaying batch ${saved.batchId} from ${file}, nothing is sent and nothing is spent`);
  return {
    batchId: saved.batchId,
    results: new Map(Object.entries(saved.results)),
    startedAt: new Date(),
    replayed: true,
  };
}

type CaseReport = {
  slug: string;
  version: string;
  outcome: "evaluated" | "no-output" | "invalid-output";
  reason?: string;
  // The Summary itself: a report you cannot read the Summary back from only says how it scored.
  content?: SummaryContent;
  // What the batch billed, so a model is priced on measured tokens and not on an estimate (#57).
  usage?: SummaryUsage;
  evaluation?: SummaryEvaluation;
};

const reports: CaseReport[] = cases.map((item) => {
  const head = { slug: item.slug, version: item.version };
  const result = results.get(idOf(item.slug, item.version));
  if (result === undefined) return { ...head, outcome: "no-output", reason: "missing from the batch" };
  if (result.type !== "succeeded") return { ...head, outcome: "no-output", reason: `${result.type}: ${result.message}` };
  const parsed = parseSummaryOutput(result.text);
  if (!parsed.ok) return { ...head, outcome: "invalid-output", reason: parsed.reason, usage: result.usage };
  const expected: ExpectedSummary = item.expected;
  return {
    ...head,
    outcome: "evaluated",
    content: parsed.content,
    usage: result.usage,
    evaluation: evaluateSummary({ expected, content: parsed.content, notes: item.text }),
  };
});

const evaluated = reports.filter((report) => report.evaluation !== undefined);
const totals = {
  cases: reports.length,
  evaluated: evaluated.length,
  unusable: reports.length - evaluated.length,
  actionRequiredMatches: evaluated.filter((report) => report.evaluation?.actionRequiredMatches === true).length,
  notesJudgeableMatches: evaluated.filter((report) => report.evaluation?.notesJudgeableMatches === true).length,
  notesJudgeableUnanswered: evaluated.filter((report) => report.evaluation?.notesJudgeableMatches === null).length,
  missing: evaluated.flatMap((report) => report.evaluation?.missing ?? []).length,
  unexpected: evaluated.flatMap((report) => report.evaluation?.unexpected ?? []).length,
  inventedQuotes: evaluated.flatMap((report) => report.evaluation?.inventedQuotes ?? []).length,
  quoted: evaluated.reduce((sum, report) => sum + (report.evaluation?.quoted ?? 0), 0),
  unquoted: evaluated.reduce((sum, report) => sum + (report.evaluation?.unquoted ?? 0), 0),
  inputTokens: reports.reduce((sum, report) => sum + (report.usage?.inputTokens ?? 0), 0),
  outputTokens: reports.reduce((sum, report) => sum + (report.usage?.outputTokens ?? 0), 0),
};

const report = { promptVersion: PROMPT_VERSION, model, batchId, startedAt, replayed, totals, cases: reports };
const stamp = startedAt.toISOString().replaceAll(/[:.]/g, "-");
const path = join(SET_DIR, "reports", `${PROMPT_VERSION}-${model}-${stamp}.json`);
await mkdir(dirname(path), { recursive: true });
await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
// What the model answered, kept apart from how it scored. A batch is paid for once and rereading it
// is free, so a fix to the schema or to the report never costs a second batch (#93).
const resultsPath = path.replace(/\.json$/, ".results.json");
await writeFile(resultsPath, `${JSON.stringify({ batchId, results: Object.fromEntries(results) }, null, 2)}\n`, "utf8");

for (const item of reports) {
  console.log(`\n${item.slug} ${item.version} — ${item.outcome}${item.reason === undefined ? "" : `: ${item.reason}`}`);
  if (item.evaluation === undefined) continue;
  const { missing, unexpected, inventedQuotes, tolerated, actionRequiredMatches, titleLength } = item.evaluation;
  const judgeable = item.evaluation.notesJudgeableMatches;
  console.log(`  title (${titleLength}): ${item.content?.title ?? ""}`);
  console.log(`  actionRequired ${String(item.content?.actionRequired)} — ${actionRequiredMatches ? "as expected" : "WRONG"}`);
  const judgeableVerdict = judgeable === null ? "not asked" : judgeable ? "as expected" : "WRONG";
  console.log(`  notesJudgeable ${String(item.content?.notesJudgeable)} — ${judgeableVerdict}`);
  if (missing.length > 0) console.log(`  MISSING: ${missing.join(", ")}`);
  if (tolerated.length > 0) console.log(`  tolerated: ${tolerated.join(", ")}`);
  for (const claim of unexpected) console.log(`  UNEXPECTED (${claim.quote}): ${claim.change}`);
  for (const quote of inventedQuotes) console.log(`  INVENTED QUOTE: ${quote}`);
}

console.log(`\n${JSON.stringify(totals, null, 2)}\nreport: ${path}\nresults: ${resultsPath}`);
