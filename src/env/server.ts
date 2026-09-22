import "server-only";

import { parseServerEnv } from "./parse-env";

export type { ServerEnv } from "./parse-env";

export const serverEnv = parseServerEnv({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
});
