import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolve = {
  alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "eslint/**/*.test.ts", "catalog/**/*.test.ts", "supabase/*.test.ts"],
          // Linting the fixtures loads the whole ESLint config on first use.
          testTimeout: 30_000,
          // As the integration project below, and for the same reason: a server module imports
          // `server-only`, which throws outside React Server Components. A server module whose only
          // dependency is a file on this disk belongs here and not among the integration tests,
          // which refuse to start until a service is running (issue #211).
          alias: { "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)) },
        },
      },
      {
        resolve,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["tests/integration/global-setup.ts"],
          testTimeout: 30_000,
          // The Catalog sync reads and retires every Technology: files must not interleave.
          fileParallelism: false,
          // Server modules run here outside React Server Components.
          alias: { "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)) },
        },
      },
    ],
  },
});
