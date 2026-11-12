import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
  // `1` while the public showcase is being built (issue #215), unset for the app with the server.
  // Declared here because every variable is declared here; it is read from `src/lib/static-site.ts`
  // instead of from `env`, and that file says why.
  NEXT_PUBLIC_STATIC_SITE: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.literal("1").optional(),
  ),
});

// Server-only: never read these from a module that can reach the client bundle.
const ServerEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  // Bearer token of the job endpoints. Without it they refuse every request; empty counts as unset.
  CRON_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(32).optional()),
  // Raises GitHub's limit from 60 requests an hour; the Detection reads notes only for new Releases.
  GITHUB_TOKEN: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
  // Only for the end-to-end tests: it is what /api/test/revalidate and /test/throw ask for before
  // they answer at all. Never set in production, where both are a 404.
  // ⚠️ **It stays, and it keeps its name**, although issue #210 lists it with the three variables
  // of the login. The three were the login; this one only shared its prefix, and what it guards --
  // dropping a cached render, and a page that throws on purpose -- has nothing to do with signing
  // in. Removing it would not remove a login, it would remove a guard and leave two test-only
  // routes answering in production. Renaming it to `E2E_SECRET` would be right and costs one line
  // in `.github/workflows/ci.yml`, which is a file this branch may not touch.
  E2E_AUTH_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(32).optional()),
  // The Slack app behind "Add to Slack" (#188), which Verdict owns: the client ID travels in the
  // open in the consent URL, the secret never leaves the server and also signs the `state`. Both
  // unset is the normal state in development, where the round cannot run at all: Slack demands an
  // HTTPS `redirect_uri`, so the manual webhook field is the only way in there.
  SLACK_CLIENT_ID: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
  SLACK_CLIENT_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
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
