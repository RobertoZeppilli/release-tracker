import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

// Inside the 30-day window the Dashboard looks back on, whenever the suite runs.
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

let developer: FixtureDeveloper;
let breaking: FixtureTechnology;
let safe: FixtureTechnology;

test.beforeAll(async () => {
  [developer, breaking, safe] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      { version: "4.0.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: true, publishedAt: daysAgo(3) },
    ]),
    seedTechnology([
      { version: "2.1.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(5) },
    ]),
  ]);
});

test.afterAll(async () => {
  // A follow left by the last test still references the Technology, so it goes first.
  await developer.clearFollows();
  await Promise.all([developer.remove(), breaking.remove(), safe.remove()]);
});

test.beforeEach(async () => {
  await developer.clearFollows();
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

test("says what needs action and shows the breaking changes", async ({ page }) => {
  await addFollows(developer.id, [breaking.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("1 needs action");
  await expect(page.getByRole("link", { name: breaking.name })).toBeVisible();
  await expect(page.getByText("action required · 1 breaking change")).toBeVisible();
  await expect(page.getByText("The default export is gone")).toBeVisible();
  await expect(page.getByLabel("Followed technologies")).toContainText("1");
});

test("says nothing needs action when every featured Release is safe", async ({ page }) => {
  await addFollows(developer.id, [safe.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("nothing needs action");
  await expect(page.getByText("safe to upgrade")).toBeVisible();
});

test("carries the counts line to the Spotlight section with the keyboard", async ({ page }) => {
  await addFollows(developer.id, [breaking.id, safe.id]);
  await signIn(page);
  await page.goto("/dashboard");

  const link = page.getByRole("link", { name: /featured/ });
  await link.focus();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#spotlight$/);
  await expect(page.getByRole("heading", { name: /spotlight \(2\)/ })).toBeVisible();
});

test("offers the Catalog when the Developer follows nothing, and follows from there", async ({ page }) => {
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByText("you follow no technologies yet")).toBeVisible();
  await expect(page.getByLabel("Followed technologies")).toContainText("0");

  // Whichever Technology the shortlist happens to open with: the point is that following works
  // here exactly as it does on /technologies, and that the page then has a stack to show.
  const first = page.getByRole("button", { name: /^Follow / }).first();
  await first.click();
  await expect(page.getByLabel("Followed technologies")).toContainText("1");

  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.getByText("you follow no technologies yet")).toBeHidden();
  await expect(page.getByRole("heading", { name: /spotlight \(1\)/ })).toBeVisible();
});
