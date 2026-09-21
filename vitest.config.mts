import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "eslint/**/*.test.ts"],
    // Linting the fixtures loads the whole ESLint config on first use.
    testTimeout: 30_000,
  },
});
