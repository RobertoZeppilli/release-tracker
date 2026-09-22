import { execSync } from "node:child_process";
import type { TestProject } from "vitest/node";
import { z } from "zod";

const LocalSupabaseSchema = z.object({
  API_URL: z.url(),
  PUBLISHABLE_KEY: z.string().min(1),
  SECRET_KEY: z.string().min(1),
});

export type LocalSupabase = z.infer<typeof LocalSupabaseSchema>;

declare module "vitest" {
  export interface ProvidedContext {
    supabase: LocalSupabase;
  }
}

// Reads URL and keys from the running local stack, so no env file is needed locally or in CI.
export default function setup(project: TestProject) {
  let output: string;
  try {
    output = execSync("pnpm exec supabase status -o json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    throw new Error("Local Supabase is not running. Start it with `pnpm db:start`.");
  }
  const json: unknown = JSON.parse(output.slice(output.indexOf("{")));
  project.provide("supabase", LocalSupabaseSchema.parse(json));
}
