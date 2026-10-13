import { expect, type Page, test } from "@playwright/test";
import { e2eAuthSecret, type FixtureDeveloper, type FixtureTechnology, seedDeveloper, seedTechnology } from "./fixtures";

// The guard of issue #63: no page is a dead end. Below 640px the navigation used to be hidden, so a
// phone reading a Release page had the wordmark and nothing else. The checks below walk the way out
// at 390px, where the slot is a strip under the bar rather than a row inside it. Since issue #119
// the slot holds the two sections on every page and the breadcrumb sits in the content.

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

// The bar carries no sections on a phone and does not grow a strip for them: they are lines of the
// account instead. For a viewer with no account the way out of a public page is not the bar's job
// either, and it is not missing: the breadcrumb sits in the content and climbs to the Technology and
// on to the Catalog, which is what the test above walks. Both destinations are behind sign-in
// anyway, so a link to them in a visitor's bar only ever bounced off it.
test("at 390px the bar holds no sections, and the page never gets wider than the phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto(`/technologies/${technology.slug}/2.0.0`);

  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("link", { name: "sign in" })).toBeVisible();

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

  const mark = await page.getByRole("link", { name: "verdict:" }).boundingBox();
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

// The one surface on the page that floats, and it was the one missing the only vertical edge the page
// has: `right-0` aligns to the positioning box, which carries the gutter as padding, so the panel hung
// 24px past it. A direct relative of the zero-spacing trap, paid for three times now.
test("the account panel is right-aligned to the page's own gutter", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: /^Account/ }).click();
  const panel = await page.locator("#account-panel").boundingBox();
  // The gutter is padding, not an edge, so it has to be taken off `main`: the content column ends
  // where the padding begins, and that is the line the panel owes its right edge to.
  const gutter = await page.locator("main").evaluate((node) => {
    const box = node.getBoundingClientRect();
    return box.right - Number.parseFloat(getComputedStyle(node).paddingRight);
  });
  expect(panel, "the account panel").not.toBeNull();
  expect(Math.round((panel?.x ?? 0) + (panel?.width ?? 0)), "the right edge of the panel").toBe(
    Math.round(gutter),
  );
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
  // The way out sits at the bottom edge, under the thumb.
  const out = await page.getByRole("button", { name: "sign out" }).boundingBox();
  expect(out?.y).toBeGreaterThan(PHONE.height / 2);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(account).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});

// On a phone the sections are the account's, and there is still exactly one copy of each link on the
// page: the row in the bar is `display: none` at this width and these rows are above it, so a screen
// reader never meets the same navigation twice (the objection that kept them out of the panel in
// issue #119, answered by the breakpoint instead of by leaving them in the open).
test("at 390px the sections are in the account, one copy of each", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: "technologies", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: /^Account/ }).click();
  const panel = page.locator("#account-panel");
  await expect(panel.getByRole("link", { name: "technologies", exact: true })).toBeVisible();
  // The page it is on says so, and says it in the one place the links now are.
  await expect(panel.getByRole("link", { name: "dashboard", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "dashboard", exact: true })).toHaveCount(1);

  // Following one closes the sheet, which otherwise stays over the page it just asked for.
  await panel.getByRole("link", { name: "technologies", exact: true }).click();
  await expect(page).toHaveURL("/technologies");
  await expect(panel).toBeHidden();
});

// Above 640px the account holds none of them: there the row in the bar is the copy, and a second
// `dashboard` in the panel would be the duplicate issue #119 removed.
test("above 640px the account holds no sections", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: /^Account/ }).click();
  await expect(page.locator("#account-panel").getByRole("link", { name: "dashboard", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "dashboard", exact: true })).toHaveCount(1);
});

// The token specimen that used to stand in for the landing had a header of its own with no links
// at all: from there the app was unreachable. Above 640px the sections are in its bar; on a phone
// they are not, and what leads into the app is the page's own entry action, which is the one thing
// on the landing allowed to answer the unknown session with a guess (DESIGN.md, The Bench).
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
  const entry = page.getByRole("link", { name: /Sign in with GitHub|Go to your dashboard/ });
  await expect(entry.first()).toBeVisible();
});

// Above 640px the panel is the one surface that floats over the page, and it has to hand the
// keyboard what it opened. It used to focus its first `a, button`, which is the sheet's
// `Close account`: at this width that row is `display: none`, `.focus()` on it does nothing, and the
// focus stayed on the trigger with the next Tab landing on the theme toggle, which sits in the bar
// and is not part of the panel. Since issue #119 the first visible line is `sign out`, the only one
// the panel still has.
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
  await expect(panel.getByRole("button", { name: "sign out" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(account).toBeFocused();
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
