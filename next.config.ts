import type { NextConfig } from "next";
import { parseServerEnv } from "./src/env/parse-env";

// Validates the environment when `next dev`, `next build` or `next start` load the config,
// so the app refuses to start with a missing or invalid variable.
import "./src/env";
// src/env/server.ts imports `server-only`, which throws outside React Server Components.
parseServerEnv(process.env);

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The GitHub picture in the top bar. It is served through the optimizer, from our own origin, so
  // the browser never calls GitHub: no page of this app talks to a third party from the client.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/u/**" }],
  },
};

export default nextConfig;
