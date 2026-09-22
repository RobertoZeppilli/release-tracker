import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { readCatalogDirectory, syncCatalog } from "@/modules/catalog/server";

// Run by the Deploy workflow after the migrations (ADR 0005), never by a Vercel build:
// previews share the production database and would write their branch's Catalog.
const SyncEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
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
