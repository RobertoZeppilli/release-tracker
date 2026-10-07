import { expect, type Page, test } from "@playwright/test";
import { e2eAuthSecret, type FixtureDeveloper, type FixtureTechnology, seedDeveloper, seedTechnology } from "./fixtures";

// The guard of issue #63: no page is a dead end. Below 640px the navigation used to be hidden, so a
// phone reading a Release page had the wordmark and nothing else. The checks below walk the way out
// at 390px, where the slot is a strip under the bar rather than a row inside it.

const PHONE = { width: 390, height: 844 };

let technology: FixtureTechnology;
let developer: FixtureDeveloper;

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

test.beforeAll(async () => {
  developer = await seedDeveloper();
  technology = await seedTechnology([
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "# 2.0.0\n\nThe default export is gone.", actionRequired: true },
  ]);
});

test.afterAll(async () => {
  await Promise.all([technology.remove(), developer.remove()]);
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

// On a phone the account is the page while it is open: a panel the size of a business card over a
// page the reader cannot use is worse than taking the screen and giving it back.
test("the account takes the whole screen at 390px, and gives it back", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await signIn(page);
  await page.goto("/dashboard");

  const account = page.getByRole("button", { name: /^Account/ });
  await account.click();
  const sheet = page.locator("#account-panel");
  const box = await sheet.boundingBox();
  expect(box?.width).toBe(PHONE.width);
  expect(box?.height).toBe(PHONE.height);
  // The page behind it must not scroll under the sheet.
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  // The way out sits at the bottom edge, away from the two destinations and under the thumb.
  const out = await page.getByRole("button", { name: "sign out" }).boundingBox();
  expect(out?.y).toBeGreaterThan(PHONE.height / 2);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(account).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});

// Behind sign-in the two destinations live in the account panel on a phone, so the bar keeps one
// row: the strip was a second copy of what the panel already carries from every page.
test("a signed-in page gives its sections to the account panel at 390px", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  await page.getByRole("button", { name: /^Account/ }).click();
  await expect(page.getByRole("link", { name: "technologies", exact: true })).toBeVisible();
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

// Above 640px the panel is the one surface that floats over the page, and it has to hand the
// keyboard what it opened. It used to focus its first `a, button`, which is the sheet's
// `Close account`: at this width that row is `display: none`, `.focus()` on it does nothing, and the
// focus stayed on the trigger with the next Tab landing on the theme toggle, which sits in the bar
// and is not part of the panel.
test("the account panel hands the keyboard its first visible line, above 640px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page);
  await page.goto("/dashboard");

  const account = page.getByRole("button", { name: /^Account/ });
  await account.focus();
  await page.keyboard.press("Enter");

  const panel = page.locator("#account-panel");
  await expect(panel).toBeVisible();
  // The close button of the phone sheet is in the DOM and must not be what the focus goes to.
  await expect(page.getByRole("button", { name: "Close account" })).toBeHidden();
  const dashboard = panel.getByRole("link", { name: "dashboard" });
  await expect(dashboard).toBeFocused();

  // From there the walk is the panel's own lines, in the order they are read.
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "technologies" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("button", { name: "sign out" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(account).toBeFocused();
});
