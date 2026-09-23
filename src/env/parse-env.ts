import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
});

// Server-only: never read these from a module that can reach the client bundle.
const ServerEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  // Bearer token of the job endpoints. Without it they refuse every request; empty counts as unset.
  CRON_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(32).optional()),
  // Without it the summary jobs answer 503; an app that only reads Summaries still starts.
  ANTHROPIC_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().startsWith("sk-ant-").optional(),
  ),
});

export type Env = z.infer<typeof EnvSchema>;
export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export class InvalidEnvError extends Error {
  constructor(issues: readonly z.core.$ZodIssue[]) {
    const lines = issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
    super(
      [
        "Invalid environment variables:",
        ...lines,
        "Copy .env.example to .env.local and fill in the values.",
      ].join("\n"),
    );
    this.name = "InvalidEnvError";
  }
}

function parseWith<T>(schema: z.ZodType<T>, source: Record<string, string | undefined>): T {
  const result = schema.safeParse(source);
  if (!result.success) throw new InvalidEnvError(result.error.issues);
  return result.data;
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  return parseWith(EnvSchema, source);
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return parseWith(ServerEnvSchema, source);
}
