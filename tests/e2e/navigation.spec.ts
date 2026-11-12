import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// The guard of issue #63: no page is a dead end. Below 640px the navigation used to be hidden, so a
// phone reading a Release page had the wordmark and nothing else. The checks below walk the way out
// at 390px, where the slot is a strip under the bar rather than a row inside it. Since issue #119
// the slot holds the two sections on every page and the breadcrumb sits in the content.

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

  // The last step is the Catalog itself, which the login used to stand in front of (issue #210).
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "technologies" }).click();
  await expect(page).toHaveURL("/technologies");
});

// The bar carries no sections on a phone and does not grow a strip for them: they are lines of the
// menu instead. The way out of a public page is not the bar's job either, and it is not missing:
// the breadcrumb sits in the content and climbs to the Technology and on to the Catalog, which is
// what the test above walks.
test("at 390px the bar holds no sections, and the page never gets wider than the phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();

  const header = await page.locator("header").boundingBox();
  expect(header?.height, "the bar is one row").toBeLessThanOrEqual(57);

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "the one-row header adds no horizontal overflow").toBeLessThanOrEqual(clientWidth);
});

test("above 640px the slot stays inside the bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  const mark = await page.getByRole("banner").getByRole("link", { name: "verdict:" }).boundingBox();
  const strip = await page.getByRole("navigation", { name: "Sections" }).boundingBox();
  expect(mark).not.toBeNull();
  expect(strip).not.toBeNull();
  if (!mark || !strip) return;
  expect(strip.x, "the sections sit to the right of the wordmark").toBeGreaterThan(mark.x + mark.width - 1);
  expect(strip.y, "on one row with the wordmark").toBeLessThan(mark.y + mark.height);
});

// Where the page sits left the bar for the content, so the two things that used to fight over one
// slot are both visible at once: the sections in the bar, the breadcrumb under it (issue #119).
test("the breadcrumb is in the content, below the header, on a Release page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  const header = await page.locator("header").boundingBox();
  const crumb = await page.getByRole("navigation", { name: "Breadcrumb" }).boundingBox();
  const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect(header).not.toBeNull();
  expect(crumb).not.toBeNull();
  expect(heading).not.toBeNull();
  if (!header || !crumb || !heading) return;

  expect(crumb.y, "the breadcrumb starts below the header").toBeGreaterThanOrEqual(header.y + header.height);
  expect(crumb.y, "and above the page title").toBeLessThan(heading.y);
});

// On a phone the menu is the page while it is open: a panel the size of a business card over a
// page the reader cannot use is worse than taking the screen and giving it back.
test("the menu takes the whole screen at 390px, and gives it back", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/dashboard");

  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  const sheet = page.locator("#menu-panel");
  const box = await sheet.boundingBox();
  expect(box?.width).toBe(PHONE.width);
  expect(box?.height).toBe(PHONE.height);
  // The page behind it must not scroll under the sheet.
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  // The preferences sit at the bottom edge, under the thumb, where the way out used to be.
  const out = await page.getByRole("link", { name: "settings" }).boundingBox();
  expect(out?.y).toBeGreaterThan(PHONE.height / 2);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(menu).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});

// Turning the phone on its side while the menu is up. Both the sheet and the button that opens it
// are the phone's alone, so above 640px they stop being rendered: what must not stay behind is the
// locked `body` scroll, which would leave a page that does not scroll and nothing to close.
test("the menu goes when the screen grows past the width it belongs to", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("#menu-panel")).toBeVisible();

  await page.setViewportSize({ width: 844, height: PHONE.width });
  await expect(page.locator("#menu-panel")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .not.toBe("hidden");
});

// On a phone the sections are the menu's, and there is still exactly one copy of each link on the
// page: the row in the bar is `display: none` at this width and these rows are above it, so a screen
// reader never meets the same navigation twice (the objection that kept them out of the panel in
// issue #119, answered by the breakpoint instead of by leaving them in the open).
test("at 390px the sections are in the menu, one copy of each", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: "technologies", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Menu" }).click();
  const panel = page.locator("#menu-panel");
  await expect(panel.getByRole("link", { name: "technologies", exact: true })).toBeVisible();
  // The page it is on says so, and says it in the one place the links now are.
  await expect(panel.getByRole("link", { name: "dashboard", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "dashboard", exact: true })).toHaveCount(1);

  // Following one closes the sheet, which otherwise stays over the page it just asked for.
  await panel.getByRole("link", { name: "technologies", exact: true }).click();
  await expect(page).toHaveURL("/technologies");
  await expect(panel).toBeHidden();
});

// Above 640px there is no menu at all: the sections are the row in the bar and the preferences a
// word beside the bell, so a panel would be a press to reach a link that already fits.
test("above 640px there is no menu, and the settings are a word in the bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dashboard");

  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(page.getByRole("banner").getByRole("link", { name: "settings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "dashboard", exact: true })).toHaveCount(1);
});

// The token specimen that used to stand in for the landing had a header of its own with no links
// at all: from there the app was unreachable. Above 640px the sections are in its bar; on a phone
// they are not, and what leads into the app is the page's own entry action (DESIGN.md, The Bench).
test("the home page offers both sections above 640px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const sections = page.getByRole("navigation", { name: "Sections" });
  await expect(sections.getByRole("link", { name: "dashboard", exact: true })).toBeVisible();
  await expect(sections.getByRole("link", { name: "technologies", exact: true })).toBeVisible();
  await expect(sections.getByRole("link", { name: "dashboard", exact: true })).toHaveAttribute("href", "/dashboard");
});

test("the home page leads into the app at 390px, through its own action", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  const entry = page.getByRole("link", { name: "Go to your dashboard" });
  await expect(entry.first()).toBeVisible();
});

// The sheet has to hand the keyboard what it opened, and give it back when it closes: it used to
// focus its first `a, button` whether or not that row was rendered at the current width, which
// left the focus on the trigger with the next Tab landing on the theme toggle, outside the panel.
test("the menu hands the keyboard its first line, and takes it back", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/dashboard");

  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");

  const panel = page.locator("#menu-panel");
  await expect(panel).toBeVisible();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(menu).toBeFocused();
});

// DESIGN.md, Layout: the bar stays on the screen, on every page. The destinations are what a reader
// at the bottom of a long list of Releases needs, and that is exactly where they used to be out of
// reach without scrolling back. The bar keeps its height while the page moves under it.
test("the top bar is still there at the bottom of a long page", async ({ page }) => {
  await page.goto("/technologies");
  const bar = page.getByRole("banner");
  const height = (await bar.boundingBox())?.height;

  await page.keyboard.press("End");
  await expect(page.getByRole("banner").getByRole("link", { name: "verdict:" })).toBeInViewport();
  expect((await bar.boundingBox())?.height).toBe(height);
});
