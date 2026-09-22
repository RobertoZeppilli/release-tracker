import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

const ACTION = {
  title: "The default export is gone and `init()` is async.",
  keyPoints: ["Named exports only.", "`init()` returns a promise.", "Node 20 or later.", "Smaller bundle."],
  breakingChanges: [
    { change: "The default export is gone", migration: "Import `{ create }` instead." },
    { change: "`init()` is async", migration: "Await `init()` before using the client." },
  ],
  actionRequired: true,
};

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "1.0.0", significance: "featured", origin: "imported", status: "failed", notes: "Big notes." },
    { version: "1.1.0", significance: "notable", origin: "detected", status: "ready", notes: "Adds a flag.", actionRequired: false },
    { version: "1.2.0", significance: "notable", origin: "detected", status: "ready", notes: "Adds more.", summary: { actionRequired: false } },
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "## Breaking", summary: ACTION },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("ready with action required: verdict, title, key points and numbered breaking changes", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  await expect(page.locator("#verdict")).toHaveText("warning: action required");
  await expect(page.getByRole("link", { name: "2 breaking changes" })).toHaveAttribute("href", "#breaking");
  await expect(page.getByText("4 key points")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "The default export is gone and init() is async." })).toBeVisible();
  await expect(page.getByText("summary · from the release notes only · claude-opus-5 · prompt v1")).toBeVisible();

  const points = page.getByRole("list", { name: "Key points" }).getByRole("listitem");
  await expect(points).toHaveCount(4);
  await expect(points.nth(1)).toHaveText("note: init() returns a promise.");
  await expect(points.nth(1).locator("code")).toHaveText("init()");

  await expect(page.getByRole("heading", { level: 2, name: "breaking changes (2)" })).toBeVisible();
  const second = page.getByRole("article", { name: "breaking[2]: init() is async" });
  await expect(second).toContainText("help: Await init() before using the client.");
  await expect(page.getByRole("region", { name: "Summary status" })).toHaveCount(0);
});

test("ready and safe: zero breaking changes and no breaking section", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.1.0`);
  await expect(page.locator("#verdict")).toHaveText("ok: safe to upgrade");
  await expect(page.getByText("0 breaking changes")).toBeVisible();
  await expect(page.locator("#breaking")).toHaveCount(0);
  await expect(page.locator("#verdict svg")).toHaveAttribute("aria-hidden", "true");
});

test("failed: the Summary is unavailable and the notes remain", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.0.0`);
  await expect(page.getByRole("region", { name: "Summary status" })).toContainText("error: summary unavailable");
  await expect(page.locator("#verdict")).toHaveCount(0);
  await expect(page.locator("#release-notes")).toHaveCount(1);
});

test("a ready Summary whose content does not validate reads as failed", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}/1.2.0`);
  await expect(page.getByRole("region", { name: "Summary status" })).toContainText("error: summary unavailable");
  await expect(page.locator("#verdict")).toHaveCount(0);
});
