import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { noServerImportInClient } from "./eslint/no-server-import-in-client.mjs";

const MODULES = "auth|catalog|releases|detection|summaries|dashboard|plans|i18n";

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
    plugins: { local: { rules: { "no-server-import-in-client": noServerImportInClient } } },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
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
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
