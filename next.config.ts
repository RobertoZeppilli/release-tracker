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
// ⚠️ The image optimizer is a server, so it cannot be part of an export. The one `next/image` on a
// public page is the GitHub picture in the account button, which a static build does not render at
// all (`STATIC_SITE` in `site-header-bar.tsx`).
const staticSite = process.env.NEXT_PUBLIC_STATIC_SITE === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The GitHub picture in the top bar. It is served through the optimizer, from our own origin, so
  // the browser never calls GitHub: no page of this app talks to a third party from the client.
  images: staticSite
    ? { unoptimized: true }
    : {
        remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/u/**" }],
      },
  ...(staticSite ? { output: "export" as const } : {}),
};

export default nextConfig;
