import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { readCatalogDirectory, syncCatalog } from "@/modules/catalog/server";
import { createSourceAdapters, importTechnology, technologiesAwaitingImport } from "@/modules/detection/server";

// Run by the Deploy workflow after the migrations (ADR 0005), never by a Vercel build:
// previews share the production database and would write their branch's Catalog.
const SyncEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  // Optional: without it GitHub allows 60 requests an hour.
  GITHUB_TOKEN: z.string().min(1).optional(),
});

const env = SyncEnvSchema.parse(process.env);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const operations = await syncCatalog(db, await readCatalogDirectory());
for (const operation of operations) {
  const target = operation.type === "retire" ? operation.technologyId : operation.entry.slug;
  console.log(`${operation.type} ${target}`);
}
console.log(`Catalog synced: ${operations.length} operation(s).`);

// One failing Technology does not stop the others; the next deploy retries it.
const adapters = createSourceAdapters({ githubToken: env.GITHUB_TOKEN });
let failed = 0;
for (const technology of await technologiesAwaitingImport(db)) {
  try {
    const count = await importTechnology(db, technology, adapters, new Date());
    console.log(`import ${technology.slug}: ${count} release(s)`);
  } catch (error) {
    failed++;
    console.error(`import ${technology.slug} failed:`, error);
  }
}
if (failed > 0) process.exitCode = 1;
