import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type Env = z.infer<typeof EnvSchema>;

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

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) throw new InvalidEnvError(result.error.issues);
  return result.data;
}
