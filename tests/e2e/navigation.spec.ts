import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// The guard of issue #63: no page is a dead end. Below 640px the navigation used to be hidden, so a
// phone reading a Release page had the wordmark and nothing else. The checks below walk the way out
// at 390px, where the slot is a strip under the bar rather than a row inside it.

const PHONE = { width: 390, height: 844 };

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "# 2.0.0\n\nThe default export is gone.", actionRequired: true },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("at 390px a Release page climbs to its Technology and on to the Catalog", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb).toBeVisible();

  await breadcrumb.getByRole("link", { name: technology.slug }).click();
  await expect(page.getByRole("heading", { level: 1, name: technology.name })).toBeVisible();

  // `/technologies` is behind sign-in, and the step is a link all the same: it says where the page
  // sits, and a visitor is sent to sign in with this page as the destination.
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "technologies" }).click();
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent("/technologies")}`);
});

test("at 390px the slot is a strip under the bar, and the page never gets wider than the phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  const wordmark = page.getByRole("link", { name: "release-tracker" });
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  const mark = await wordmark.boundingBox();
  const strip = await breadcrumb.boundingBox();
  expect(mark).not.toBeNull();
  expect(strip).not.toBeNull();
  if (!mark || !strip) return;

  expect(strip.y, "the strip starts below the bar").toBeGreaterThanOrEqual(mark.y + mark.height);
  expect(strip.x, "the strip starts at the gutter").toBeLessThan(mark.x + 1);
  expect(strip.width, "the strip spans the content column").toBeGreaterThan(PHONE.width - 40);

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "the two-row header adds no horizontal overflow").toBeLessThanOrEqual(clientWidth);
});

test("above 640px the slot stays inside the bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  const mark = await page.getByRole("link", { name: "release-tracker" }).boundingBox();
  const strip = await page.getByRole("navigation", { name: "Breadcrumb" }).boundingBox();
  expect(mark).not.toBeNull();
  expect(strip).not.toBeNull();
  if (!mark || !strip) return;
  expect(strip.x, "the breadcrumb sits to the right of the wordmark").toBeGreaterThan(mark.x + mark.width - 1);
  expect(strip.y, "on one row with the wordmark").toBeLessThan(mark.y + mark.height);
});

// The token specimen the home page still shows (#26 replaces it) had a header of its own with no
// links at all: from there the app was unreachable.
test("the home page offers both sections, at 390px too", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");

  const sections = page.getByRole("navigation", { name: "Sections" });
  await expect(sections.getByRole("link", { name: "dashboard" })).toBeVisible();
  await expect(sections.getByRole("link", { name: "technologies" })).toBeVisible();
  await expect(sections.getByRole("link", { name: "dashboard" })).toHaveAttribute("href", "/dashboard");
});
