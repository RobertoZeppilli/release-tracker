import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
  addNotification,
  arrived,
  clearNotifications,
  countUnseen,
  type FixtureTechnology,
  releaseIdFor,
  seedTechnology,
} from "./fixtures";

// The bell and its panel (issue #170). The number is read in the browser, so every assertion here is
// about what the bar shows **after** the session has arrived, never about the first paint.

let technology: FixtureTechnology;
let featured: string;
let notable: string;

test.beforeAll(async () => {
  [technology] = await Promise.all([
    seedTechnology([
      { version: "1.0.0", significance: "notable", origin: "detected", status: "ready", notes: "# 1.0.0", actionRequired: false },
      { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "# 2.0.0", actionRequired: true },
    ]),
  ]);
  [notable, featured] = await Promise.all([
    releaseIdFor(technology.id, "1.0.0"),
    releaseIdFor(technology.id, "2.0.0"),
  ]);
  await addFollows([technology.id]);
});

// ⚠️ The Notifications go first: `release_id` is a plain foreign key, so a Release with a
// Notification pointing at it cannot be deleted, and `remove` deletes the Releases.
test.afterAll(async () => {
  await clearNotifications();
  await technology.remove();
});

test.afterEach(async () => {
  await clearNotifications();
});


// By what it controls and not by its name: the name is the thing under test and it is translated,
// so a locator reading it would only work in English (ADR 0008).
function bell(page: Page) {
  return page.locator('button[aria-controls="notification-panel"]');
}

test("the number is in the bell's own name, and the panel names the Technology and the Version", async ({ page }) => {
  await addNotification(featured);
  await addNotification(notable, "notable_release");
  await page.goto("/dashboard");
  await arrived(page);

  await expect(bell(page)).toHaveAccessibleName("Notifications, 2 unseen");
  await bell(page).click();

  const panel = page.locator("#notification-panel");
  await expect(panel.getByText(technology.name).first()).toBeVisible();
  await expect(panel.getByRole("link", { name: "2.0.0" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "1.0.0" })).toBeVisible();
});

test("marking one as seen takes the number down without a reload, and it stays down", async ({ page }) => {
  await addNotification(featured);
  await addNotification(notable, "notable_release");
  await page.goto("/dashboard");
  await arrived(page);
  await bell(page).click();

  await page.getByRole("button", { name: `Mark ${technology.name} 2.0.0 as seen` }).click();
  await expect(bell(page)).toHaveAccessibleName("Notifications, 1 unseen");
  await expect.poll(() => countUnseen()).toBe(1);

  await page.reload();
  await arrived(page);
  await expect(bell(page)).toHaveAccessibleName("Notifications, 1 unseen");
});

test("marking everything as seen clears the number and the database with it", async ({ page }) => {
  await addNotification(featured);
  await addNotification(notable, "notable_release");
  await page.goto("/dashboard");
  await arrived(page);
  await bell(page).click();

  await page.getByRole("button", { name: "mark all as seen" }).click();
  await expect(bell(page)).toHaveAccessibleName("Notifications, none unseen");
  await expect.poll(() => countUnseen()).toBe(0);
});

test("says what an empty bell means instead of opening on nothing", async ({ page }) => {
  await page.goto("/dashboard");
  await arrived(page);

  await expect(bell(page)).toHaveAccessibleName("Notifications, none unseen");
  await bell(page).click();
  await expect(page.locator("#notification-panel")).toContainText("Nothing yet");
});

test("Escape closes the panel and gives the focus back to the bell", async ({ page }) => {
  await addNotification(featured);
  await page.goto("/dashboard");
  await arrived(page);

  await bell(page).click();
  await expect(page.locator("#notification-panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#notification-panel")).toHaveCount(0);
  await expect(bell(page)).toBeFocused();
});

test("the version in the panel opens the Release page", async ({ page }) => {
  await addNotification(featured);
  await page.goto("/dashboard");
  await arrived(page);

  await bell(page).click();
  await page.locator("#notification-panel").getByRole("link", { name: "2.0.0" }).click();
  await expect(page).toHaveURL(new RegExp(`/technologies/${technology.slug}/2.0.0$`));
  // Reading the Release is seeing the Notification, so the number is already down when the page
  // lands: nothing else would make the bell disagree with the page the reader is on.
  await expect.poll(() => countUnseen()).toBe(0);
});

// The bell belongs to the installed app, so the public landing has none: `/en` is a 308 to `/`,
// which the showcase and the app both serve, and the bar there is the product's own.
test("the bell is in the bar of the app, on every one of its pages", async ({ page }) => {
  await page.goto("/technologies");
  await arrived(page);
  await expect(bell(page)).toBeVisible();

  await page.goto("/settings");
  await arrived(page);
  await expect(bell(page)).toBeVisible();
});

test("the bar holds one row at 320px in German, with the number in it", async ({ page }) => {
  await addNotification(featured);
  await addNotification(notable, "notable_release");
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto("/de/dashboard");
  await arrived(page);

  await expect(bell(page)).toBeVisible();
  const header = page.locator("header");
  expect((await header.boundingBox())?.height).toBeLessThanOrEqual(57);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
});
