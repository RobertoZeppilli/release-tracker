import type { NextConfig } from "next";
import { parseServerEnv } from "./src/env/parse-env";

// Validates the environment when `next dev`, `next build` or `next start` load the config,
// so the app refuses to start with a missing or invalid variable.
import "./src/env";
// src/env/server.ts imports `server-only`, which throws outside React Server Components.
parseServerEnv(process.env);

// The public showcase (issue #215): the same source built as files alone, so no issue that touches
// the app's server can take the site down, and so the ISR writes of the Release pages go to zero.
// `scripts/build-static.mts` is what sets the variable, after taking the non-public routes out of
// the tree it builds from: `output: "export"` is a global setting and refuses a Server Action or a
// route handler **anywhere** in the tree, exported or not.
const staticSite = process.env.NEXT_PUBLIC_STATIC_SITE === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // ⚠️ No `remotePatterns`: the one remote image this app ever loaded was the GitHub picture in the
  // account button, and the account left with the login (issue #210, ADR 0011). Every image the
  // product draws now comes from the repository itself, so nothing has to be allowed in.
  images: staticSite ? { unoptimized: true } : {},
  ...(staticSite ? { output: "export" as const } : {}),
};

export default nextConfig;
