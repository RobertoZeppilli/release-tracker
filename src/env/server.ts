import "server-only";

import { parseServerEnv } from "./parse-env";

export type { ServerEnv } from "./parse-env";

export const serverEnv = parseServerEnv({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  E2E_AUTH_SECRET: process.env.E2E_AUTH_SECRET,
  DEV_LOGIN_EMAIL: process.env.DEV_LOGIN_EMAIL,
  DEV_LOGIN_PASSWORD: process.env.DEV_LOGIN_PASSWORD,
});
