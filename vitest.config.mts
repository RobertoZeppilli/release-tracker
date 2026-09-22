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
          include: ["src/**/*.test.ts", "eslint/**/*.test.ts", "catalog/**/*.test.ts"],
          // Linting the fixtures loads the whole ESLint config on first use.
          testTimeout: 30_000,
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
          // Importing a server module parses the public env; tests talk to Supabase with their own clients.
          env: {
            NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
            NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
          },
        },
      },
    ],
  },
});
