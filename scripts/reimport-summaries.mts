import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { parseSummaryOutput } from "@/modules/summaries";

// Issue #56: a Summary the batch produced and we paid for, failed on validation alone, is settled
// again from the saved results of that batch instead of being sent a second time. The script never
// touches a database: it writes the `UPDATE` to run in the SQL Editor of the target environment,
// so applying it to production stays a deliberate act.
// `pnpm summary:reimport <results.json> <release-id>...`
const [file, ...releaseIds] = process.argv.slice(2);
if (!file || releaseIds.length === 0) {
  console.error("usage: pnpm summary:reimport <results.json> <release-id>...");
  process.exit(1);
}

const TextBlockSchema = z.object({ type: z.literal("text"), text: z.string() });
const SavedSchema = z.object({
  batchId: z.string(),
  results: z.record(z.string(), z.object({ type: z.string(), message: z.object({ content: z.array(z.unknown()) }) })),
});

const saved = SavedSchema.parse(JSON.parse(await readFile(file, "utf8")));

const statements = releaseIds.map((releaseId) => {
  const result = saved.results[releaseId];
  if (result === undefined) throw new Error(`${releaseId}: missing from ${saved.batchId}`);
  if (result.type !== "succeeded") throw new Error(`${releaseId}: the batch request ${result.type}`);

  const text = result.message.content
    .map((block) => TextBlockSchema.safeParse(block))
    .flatMap((block) => (block.success ? [block.data.text] : []))
    .join("");
  // The same reading `collectSummaryBatches` does, so nothing reaches the database that the pages
  // would not be able to parse back.
  const parsed = parseSummaryOutput(text);
  if (!parsed.ok) throw new Error(`${releaseId}: ${parsed.reason}`);

  console.log(`${releaseId}: ${parsed.content.title.length} characters — ${parsed.content.title}`);
  const content = JSON.stringify(parsed.content).replaceAll("'", "''");
  return [
    `-- ${releaseId}: a title of ${parsed.content.title.length} characters`,
    `update summaries set status = 'ready', content = '${content}'::jsonb, failure_reason = null, updated_at = now()`,
    // Issue #88: a ready Summary needs its provenance, and these rows already carry it, because
    // submit writes model and prompt version before the batch leaves. The guard keeps the statement
    // from reaching a Release that failed before being sent: that one would be refused, not fixed.
    `where release_id = '${releaseId}' and status = 'failed' and model is not null and prompt_version is not null;`,
  ].join("\n");
});

const out = `${file.replace(/\.json$/, "")}-reimport.sql`;
await writeFile(out, `${statements.join("\n\n")}\n`, "utf8");
console.log(`\n${statements.length} statement(s) in ${out}. Run them in the SQL Editor of the target environment.`);
