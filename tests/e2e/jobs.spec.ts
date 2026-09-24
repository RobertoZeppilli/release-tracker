import { expect, test } from "@playwright/test";

// The three job endpoints. Vercel sends `Authorization: Bearer <CRON_SECRET>`, so the address alone
// must never be enough: these endpoints write and they spend. Only the Detection is scheduled in
// `vercel.json` today — the Summary jobs stay reachable, and refusing without the secret is exactly
// what keeps them from spending while nobody calls them.
const endpoints = ["/api/jobs/detection", "/api/jobs/summaries/submit", "/api/jobs/summaries/collect"];

test.describe("job endpoints", () => {
  for (const endpoint of endpoints) {
    test(`${endpoint} refuses a request without the secret`, async ({ request }) => {
      expect((await request.get(endpoint)).status()).toBe(401);
      expect((await request.get(endpoint, { headers: { authorization: "Bearer wrong" } })).status()).toBe(401);
    });
  }
});
