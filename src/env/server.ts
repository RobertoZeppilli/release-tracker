import "server-only";

import { parseServerEnv } from "./parse-env";

export type { ServerEnv } from "./parse-env";

export const serverEnv = parseServerEnv({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
});
