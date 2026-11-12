import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { noMessageKeyInClient } from "./eslint/no-message-key-in-client.mjs";
import { noServerImportInClient } from "./eslint/no-server-import-in-client.mjs";

const MODULES = "auth|catalog|dashboard|detection|follows|i18n|landing|notifications|releases|summaries";

// ADR 0006: a module is imported only through its domain index (`@/modules/x`), its UI index
// (`@/modules/x/ui`) or, on the server, its server index (`@/modules/x/server`).
// Anything deeper belongs to the module itself.
const moduleBoundaries = {
  regex: `(^|/)modules/(${MODULES})/(?!(server|ui)$).+`,
  message: "Import a module only from @/modules/<module>, @/modules/<module>/ui or @/modules/<module>/server.",
};

// Relative paths that leave the current module to reach another one.
const relativeCrossModule = {
  regex: `^(\\.\\./)+(${MODULES})(/|$)`,
  message: "Import another module through @/modules/<module>, not a relative path.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      local: {
        rules: {
          "no-message-key-in-client": noMessageKeyInClient,
          "no-server-import-in-client": noServerImportInClient,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "local/no-message-key-in-client": "error",
      "local/no-server-import-in-client": "error",
      "no-restricted-imports": ["error", { patterns: [moduleBoundaries, relativeCrossModule] }],
    },
  },
  {
    files: ["src/modules/*/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            moduleBoundaries,
            relativeCrossModule,
            {
              regex: "^(react|react-dom|next)(/|$)",
              message: "Domain code is pure TypeScript: no React or Next.js.",
            },
            {
              regex: `((^|/)modules/(${MODULES})|^\\.\\.)/ui$`,
              message: "Domain code is pure TypeScript: no UI components.",
            },
          ],
        },
      ],
    },
  },
  // `.static-build` is the pruned copy `pnpm build:static` builds the showcase from (issue #215):
  // the same files, already linted where they live.
  globalIgnores([".next/**", ".static-build/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
