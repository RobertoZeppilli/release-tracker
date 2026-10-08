import { expect, type Page, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

const SUMMARY = {
  title: "The default export is gone and `init()` is async.",
  keyPoints: [{ text: "Named exports only." }, { text: "`init()` returns a promise." }, { text: "Node 20 or later." }],
  breakingChanges: [{ change: "The default export is gone", migration: "Import `{ create }` instead." }],
  actionRequired: true,
};

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "1.0.0", significance: "notable", origin: "imported", status: "unavailable", notes: null },
    { version: "1.1.0", significance: "notable", origin: "detected", status: "pending", notes: "Adds a flag." },
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "## Breaking", summary: SUMMARY },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

const description = (page: Page) =>
  page.locator('head meta[name="description"]').getAttribute("content");

test("a Release with a Summary is described by the Summary title, and nothing else", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  expect(await description(page)).toBe(SUMMARY.title);
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
    "content",
    `${technology.name} 2.0.0 release`,
  );
  await expect(page.locator("head link[rel=canonical]")).toHaveAttribute(
    "href",
    `http://localhost:3000/technologies/${technology.slug}/2.0.0`,
  );
});

test("a Release without a Summary is described by its Version and the day it was published", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.1.0`);

  expect(await description(page)).toBe(
    `${technology.name} 1.1.0, published 2026-01-11. The release notes as published, not yet summarized.`,
  );
});

test("a Release without a Summary and without notes claims nothing more than the Version", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.0.0`);

  expect(await description(page)).toBe(`${technology.name} 1.0.0, published 2026-01-10.`);
});

test("the canonical address of a Technology page drops the Upgrade Path query", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=1.0.0`);

  await expect(page.locator("head link[rel=canonical]")).toHaveAttribute(
    "href",
    `http://localhost:3000/technologies/${technology.slug}`,
  );
});

test("robots keeps the pages behind the login out and names the sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();

  // The `$` matters: without it the rule would shut out every Technology page as well.
  expect(body).toContain("Disallow: /technologies$");
  expect(body).toContain("Disallow: /dashboard");
  expect(body).toContain("Disallow: /login");
  expect(body).toContain("Sitemap: http://localhost:3000/sitemap.xml");
});

// The sitemap route is prerendered, in CI against the production build, so it was written before
// these fixtures existed and cannot name them. What belongs here is that the route serves the
// Catalog as absolute addresses; that it is built from the Releases, retired Technologies included,
// is covered by `tests/integration/sitemap.test.ts` on `listSitemapPages`.
test("the sitemap serves the Catalog as absolute addresses", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toContain("<loc>http://localhost:3000/technologies/vite</loc>");
  expect(body).toMatch(/<loc>http:\/\/localhost:3000\/technologies\/vite\/\d+\.\d+\.\d+<\/loc>/);
});

test("a Technology page says what the Catalog says and what the page holds", async ({ page }) => {
  await page.goto("/technologies/vite");

  expect(await description(page)).toBe(
    "Frontend build tool. Every Vite release, with a summary of what changed when there is one.",
  );
});
