import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

// ⚠️ `reuseExistingServer` trusts whatever answers on this port, and it cannot tell this app from
// another one: a dev server of a different project sitting on 3000 is the server the whole suite
// then talks to, which reads as dozens of unrelated failures. `E2E_PORT` is how a machine that keeps
// something else on 3000 gives this project a port of its own.
const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: isCI,
  // ⚠️ **Un worker solo, dalla #210.** Follows e Notifications appartenevano a uno Sviluppatore, e
  // ogni file ne seminava uno suo: era quello a isolare due file in parallelo. Adesso le righe sono
  // una tabella sola per la copia installata, e il numero sulla campanella le conta tutte, quindi
  // due file insieme si cancellano le righe a vicenda e il conteggio di uno è la somma di due. Non
  // basta restringere il `clear` alla Tecnologia del test: il numero resta globale. Misurato il
  // 2026-11-12: la suite intera ci mette 2,9 minuti in serie, gli stessi di prima in parallelo,
  // perché il tempo se ne va ad aspettare le pagine e non a calcolare.
  workers: 1,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // CI runs against the production build; locally the dev server is reused if already running.
  webServer: {
    command: isCI ? `pnpm start --port ${port}` : `pnpm dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
  },
});
