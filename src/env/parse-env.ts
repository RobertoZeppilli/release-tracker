import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
  // The client ID of the GitHub OAuth App behind the sign-in, which lives in the Supabase provider
  // settings. It is not a secret: it travels in the open in the consent URL every sign-in builds.
  // With it the account page can point at GitHub's page for this app, the one that carries `Revoke
  // access`; without it the same link goes to the list of authorised apps, which is a click further
  // and still true. Empty counts as unset.
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
});

// Server-only: never read these from a module that can reach the client bundle.
const ServerEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  // Bearer token of the job endpoints. Without it they refuse every request; empty counts as unset.
  CRON_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(32).optional()),
  // Raises GitHub's limit from 60 requests an hour; the Detection reads notes only for new Releases.
  GITHUB_TOKEN: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
  // Only for the end-to-end tests: with it the app exposes /api/test/session, which signs a test
  // Developer in without GitHub. Never set in production, where the route answers 404.
  E2E_AUTH_SECRET: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(32).optional()),
  // Only for local development: with both set, the login offers a second button that signs this
  // Developer in without GitHub. Unset in production, where the route answers 404.
  DEV_LOGIN_EMAIL: z.preprocess((value) => (value === "" ? undefined : value), z.email().optional()),
  DEV_LOGIN_PASSWORD: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional()),
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
