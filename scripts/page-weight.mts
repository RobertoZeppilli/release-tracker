import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

// The before/after measure the #142 asks for: what a page costs on a cold first visit, on a
// production build. Run it against `next start`, never against `pnpm dev`: the dev server ships
// uncompressed chunks and its own HMR client, so its numbers answer a question nobody asked.
//
// A fresh context per page is the point. Shared chunks are free on the second page of a visit and
// expensive on the first, and the first is the one that decides whether the app feels slow.

// ⚠️ No `auth` flag any more: every page of the app is reachable on a cold first visit, because
// there is nothing to sign into (issue #210, ADR 0011). The dev sign-in this script used to post to
// went with it, and `/login` is not a page.
type Route = { path: string };

const ROUTES: readonly Route[] = [
  { path: "/" },
  { path: "/dashboard" },
  { path: "/technologies" },
  { path: "/settings" },
  { path: "/technologies/next" },
  { path: "/technologies/next/16.3.0" },
];

type Measure = {
  path: string;
  status: number;
  requests: number;
  totalKB: number;
  byTypeKB: Record<string, number>;
  domNodes: number;
  bodyHeight: number;
};

const BASE = process.env.WEIGHT_BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };
const kb = (bytes: number): number => Number((bytes / 1024).toFixed(1));

async function measure(route: Route): Promise<Measure> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: VIEWPORT });

    const page = await context.newPage();
    const byType = new Map<string, number>();
    let total = 0;
    let requests = 0;

    page.on("requestfinished", async (request) => {
      try {
        const sizes = await request.sizes();
        const bytes = sizes.responseBodySize + sizes.responseHeadersSize;
        byType.set(request.resourceType(), (byType.get(request.resourceType()) ?? 0) + bytes);
        total += bytes;
        requests += 1;
      } catch {
        // A request still in flight when the page settles has no sizes yet, and no weight either.
      }
    });

    const response = await page.goto(`${BASE}${route.path}`, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    const domNodes = await page.evaluate(() => document.getElementsByTagName("*").length);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    return {
      path: route.path,
      status: response?.status() ?? 0,
      requests,
      totalKB: kb(total),
      byTypeKB: Object.fromEntries(
        [...byType.entries()].sort((a, b) => b[1] - a[1]).map(([type, bytes]) => [type, kb(bytes)]),
      ),
      domNodes,
      bodyHeight,
    };
  } finally {
    await browser.close();
  }
}

function table(rows: readonly Measure[]): string {
  const header = "| Route | Req | Total KB | Script KB | Document KB | DOM nodes | Body px |";
  const rule = "| --- | --: | --: | --: | --: | --: | --: |";
  const body = rows.map(
    (row) =>
      `| \`${row.path}\` | ${row.requests} | ${row.totalKB} | ${row.byTypeKB.script ?? 0} | ` +
      `${row.byTypeKB.document ?? 0} | ${row.domNodes} | ${row.bodyHeight} |`,
  );
  return [header, rule, ...body].join("\n");
}

const rows: Measure[] = [];
for (const route of ROUTES) rows.push(await measure(route));

console.log(table(rows));

const jsonFlag = process.argv.indexOf("--json");
if (jsonFlag !== -1) {
  const target = process.argv[jsonFlag + 1];
  if (target === undefined) throw new Error("--json needs a path");
  writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  console.log(`\nWritten to ${target}`);
}
