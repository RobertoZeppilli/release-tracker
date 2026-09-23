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
} from "@/modules/summaries";
import { createSummaryBatches } from "@/modules/summaries/server";

// The evaluation set of issue #14: every case through the real Message Batches API in one batch,
// compared against what a human said the Summary must say. Costs a few tens of cents a run.
// `pnpm summary:eval` · `pnpm summary:eval --dry` prints the set without calling Anthropic.
const SET_DIR = "eval/summaries";
const dry = process.argv.includes("--dry");

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
  return prepared.request;
});

const characters = cases.reduce((total, item) => total + item.text.length, 0);
console.log(`${cases.length} cases, ${characters} characters of notes, prompt ${PROMPT_VERSION}, model ${SUMMARY_MODEL}`);
if (dry) {
  for (const item of cases) console.log(`  ${item.slug} ${item.version}: ${item.text.length} characters — ${item.note}`);
  process.exit(0);
}

const env = z.object({ ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-") }).parse(process.env);
const batches = createSummaryBatches(env.ANTHROPIC_API_KEY);
if (batches === null) throw new Error("no ANTHROPIC_API_KEY in the environment");

const startedAt = new Date();
const batchId = await batches.submit(requests);
console.log(`batch ${batchId}, waiting (batches usually take minutes)`);

const deadline = Date.now() + 60 * 60 * 1000;
let results = await batches.collect(batchId);
while (results === null) {
  if (Date.now() > deadline) throw new Error(`batch ${batchId} is still running after an hour`);
  await new Promise((resolve) => setTimeout(resolve, 20_000));
  process.stdout.write(".");
  results = await batches.collect(batchId);
}
console.log("");

type CaseReport = {
  slug: string;
  version: string;
  outcome: "evaluated" | "no-output" | "invalid-output";
  reason?: string;
  // The Summary itself: a report you cannot read the Summary back from only says how it scored.
  content?: SummaryContent;
  evaluation?: SummaryEvaluation;
};

const reports: CaseReport[] = cases.map((item) => {
  const head = { slug: item.slug, version: item.version };
  const result = results.get(idOf(item.slug, item.version));
  if (result === undefined) return { ...head, outcome: "no-output", reason: "missing from the batch" };
  if (result.type !== "succeeded") return { ...head, outcome: "no-output", reason: `${result.type}: ${result.message}` };
  const parsed = parseSummaryOutput(result.text);
  if (!parsed.ok) return { ...head, outcome: "invalid-output", reason: parsed.reason };
  const expected: ExpectedSummary = item.expected;
  return {
    ...head,
    outcome: "evaluated",
    content: parsed.content,
    evaluation: evaluateSummary({ expected, content: parsed.content, notes: item.text }),
  };
});

const evaluated = reports.filter((report) => report.evaluation !== undefined);
const totals = {
  cases: reports.length,
  evaluated: evaluated.length,
  unusable: reports.length - evaluated.length,
  actionRequiredMatches: evaluated.filter((report) => report.evaluation?.actionRequiredMatches === true).length,
  missing: evaluated.flatMap((report) => report.evaluation?.missing ?? []).length,
  unexpected: evaluated.flatMap((report) => report.evaluation?.unexpected ?? []).length,
  inventedQuotes: evaluated.flatMap((report) => report.evaluation?.inventedQuotes ?? []).length,
  quoted: evaluated.reduce((sum, report) => sum + (report.evaluation?.quoted ?? 0), 0),
  unquoted: evaluated.reduce((sum, report) => sum + (report.evaluation?.unquoted ?? 0), 0),
};

const report = { promptVersion: PROMPT_VERSION, model: SUMMARY_MODEL, batchId, startedAt, totals, cases: reports };
const path = join(SET_DIR, "reports", `${PROMPT_VERSION}-${startedAt.toISOString().replaceAll(/[:.]/g, "-")}.json`);
await mkdir(dirname(path), { recursive: true });
await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");

for (const item of reports) {
  console.log(`\n${item.slug} ${item.version} — ${item.outcome}${item.reason === undefined ? "" : `: ${item.reason}`}`);
  if (item.evaluation === undefined) continue;
  const { missing, unexpected, inventedQuotes, tolerated, actionRequiredMatches, titleLength } = item.evaluation;
  console.log(`  title (${titleLength}): ${item.content?.title ?? ""}`);
  console.log(`  actionRequired ${String(item.content?.actionRequired)} — ${actionRequiredMatches ? "as expected" : "WRONG"}`);
  if (missing.length > 0) console.log(`  MISSING: ${missing.join(", ")}`);
  if (tolerated.length > 0) console.log(`  tolerated: ${tolerated.join(", ")}`);
  for (const claim of unexpected) console.log(`  UNEXPECTED (${claim.quote}): ${claim.change}`);
  for (const quote of inventedQuotes) console.log(`  INVENTED QUOTE: ${quote}`);
}

console.log(`\n${JSON.stringify(totals, null, 2)}\nreport: ${path}`);
