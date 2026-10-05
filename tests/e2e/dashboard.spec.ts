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
let busy: FixtureTechnology;

test.beforeAll(async () => {
  [developer, breaking, safe, busy] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      { version: "4.0.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: true, publishedAt: daysAgo(3) },
    ]),
    seedTechnology([
      { version: "2.1.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(5) },
    ]),
    // One Release per section, and two digest Releases three weeks apart so the Digest has two
    // weeks to fold and open.
    seedTechnology([
      { version: "3.1.0", significance: "notable", origin: "detected", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(2) },
      { version: "3.2.0-beta.1", significance: "preview", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(4) },
      { version: "3.0.9", significance: "digest", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(1) },
      { version: "3.0.8", significance: "digest", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(21) },
    ]),
  ]);
});

test.afterAll(async () => {
  // A follow left by the last test still references the Technology, so it goes first.
  await developer.clearFollows();
  await Promise.all([developer.remove(), breaking.remove(), safe.remove(), busy.remove()]);
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

test("fills Latest, Previews and the Weekly Digest with the window", async ({ page }) => {
  await addFollows(developer.id, [busy.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "latest (1)" })).toBeVisible();
  await expect(page.locator("#latest").getByRole("link", { name: "3.1.0" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "previews (1)" })).toBeVisible();
  await expect(page.locator("#previews").getByRole("link", { name: "3.2.0-beta.1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "weekly digest (2)" })).toBeVisible();
  await expect(page.getByText("1 digest release")).toHaveCount(2);
});

test("keeps an open week of the Digest in the URL, through a reload and in a shared link", async ({ page }) => {
  await addFollows(developer.id, [busy.id]);
  await signIn(page);
  await page.goto("/dashboard");

  const week = page.locator("#digest details").first();
  const line = page.getByRole("link", { name: "3.0.9" });
  await expect(line).toBeHidden();

  await week.locator("summary").click();
  await expect(line).toBeVisible();
  await expect(page).toHaveURL(/\?week=\d{4}-W\d{2}$/);

  const shared = page.url();
  await page.reload();
  await expect(page.getByRole("link", { name: "3.0.9" })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "3.0.9" })).toBeHidden();
  await page.goto(shared);
  await expect(page.getByRole("link", { name: "3.0.9" })).toBeVisible();

  // Closing the last open week takes the parameter out instead of leaving it empty.
  await page.locator("#digest details").first().locator("summary").click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

// DESIGN.md gives prose a 72ch measure, and the counts line used to run the whole 992px column: 142
// characters on one measure, which is the defect P2-9 of issue #47 named. The budget is computed
// from the advance of the live font, as the caret row is, instead of being guessed from the pixels.
test("keeps the counts line inside the 72ch measure", async ({ page }) => {
  await addFollows(developer.id, [breaking.id, safe.id, busy.id]);
  await signIn(page);
  await page.goto("/dashboard");

  const counts = page.getByText(/^Last 30 days across /);
  await expect(counts).toBeVisible();
  const measured = await counts.evaluate((node) => {
    const probe = document.createElement("span");
    probe.style.font = getComputedStyle(node).font;
    probe.style.position = "absolute";
    probe.style.whiteSpace = "pre";
    probe.textContent = "0".repeat(72);
    document.body.append(probe);
    const budget = probe.getBoundingClientRect().width;
    probe.remove();
    return { width: node.getBoundingClientRect().width, budget };
  });

  expect(measured.width).toBeLessThanOrEqual(measured.budget + 1);
});
