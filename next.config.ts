import type { NextConfig } from "next";
import { parseServerEnv } from "./src/env/parse-env";

// Validates the environment when `next dev`, `next build` or `next start` load the config,
// so the app refuses to start with a missing or invalid variable.
import "./src/env";
// src/env/server.ts imports `server-only`, which throws outside React Server Components.
parseServerEnv(process.env);

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
