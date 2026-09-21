import type { NextConfig } from "next";

// Validates the environment when `next dev`, `next build` or `next start` load the config,
// so the app refuses to start with a missing or invalid variable.
import "./src/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
