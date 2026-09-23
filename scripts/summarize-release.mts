import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { locateCitation, parseSummaryOutput, prepareSummaryRequest } from "@/modules/summaries";
import { createSummaryBatches } from "@/modules/summaries/server";

// A single real Release through the real Message Batches API, to read a Summary with your own eyes
// before the evaluation set exists. Costs a few cents: `pnpm summary:try <slug> <version>`.
const [slug, version] = process.argv.slice(2);
if (slug === undefined || version === undefined) {
  console.error("usage: pnpm summary:try <slug> <version>");
  process.exit(1);
}

const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
    ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
  })
  .parse(process.env);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await db
  .from("release_notes")
  .select("body, releases!inner(id, version, technologies!inner(slug, name))")
  .eq("releases.version", version)
  .eq("releases.technologies.slug", slug)
  .maybeSingle();
if (error !== null) throw error;
if (data === null) throw new Error(`no release notes for ${slug} ${version}`);

const RowSchema = z.object({
  body: z.string(),
  releases: z.object({ id: z.uuid(), version: z.string(), technologies: z.object({ name: z.string() }) }),
});
const row = RowSchema.parse(data);
const notes = row.body;

const prepared = prepareSummaryRequest({
  releaseId: row.releases.id,
  technologyName: row.releases.technologies.name,
  version: row.releases.version,
  notes,
});
if (!prepared.ok) throw new Error(`cannot summarize: ${prepared.reason}`);

const batches = createSummaryBatches(env.ANTHROPIC_API_KEY);
if (batches === null) throw new Error("no ANTHROPIC_API_KEY in the environment");

console.log(`${slug} ${version}: ${notes.length} characters of notes. Submitting...`);
const batchId = await batches.submit([prepared.request]);
console.log(`batch ${batchId}, waiting (batches usually take minutes)`);

const deadline = Date.now() + 30 * 60 * 1000;
let results = await batches.collect(batchId);
while (results === null) {
  if (Date.now() > deadline) throw new Error(`batch ${batchId} is still running after 30 minutes`);
  await new Promise((resolve) => setTimeout(resolve, 20_000));
  process.stdout.write(".");
  results = await batches.collect(batchId);
}
console.log("");

const result = results.get(row.releases.id);
if (result === undefined) throw new Error("the batch came back without this Release");
if (result.type !== "succeeded") throw new Error(`${result.type}: ${result.message}`);

const parsed = parseSummaryOutput(result.text);
if (!parsed.ok) {
  console.error(`invalid output: ${parsed.reason}`);
  console.error(result.text);
  process.exit(1);
}

const summary = parsed.content;
console.log(`\ntitle: ${summary.title}`);
console.log(`actionRequired: ${summary.actionRequired}`);
for (const point of summary.keyPoints) console.log(`note: ${point.text}${citationNote(point.quote)}`);
for (const change of summary.breakingChanges) {
  console.log(`breaking: ${change.change}${citationNote(change.quote)}`);
  console.log(`  help: ${change.migration}`);
}

// The same check the pages make: a quote that is not in the notes verbatim was invented.
function citationNote(quote: string | undefined): string {
  if (quote === undefined) return "  [no quote]";
  const citation = locateCitation(notes, quote);
  return citation === null ? `  [INVENTED QUOTE: ${quote}]` : `  [lines ${citation.fromLine}-${citation.toLine}]`;
}
