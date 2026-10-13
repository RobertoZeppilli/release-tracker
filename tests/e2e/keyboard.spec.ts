import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  e2eAuthSecret,
  followWritten,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

// The other half of the audit of issue #23: every flow completed with the keyboard alone, with the
// focus ring visible at each stop, and the one motion moment given up when the visitor asks for less
// movement. axe cannot answer either question: it reads a page at rest.

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

let developer: FixtureDeveloper;
let technology: FixtureTechnology;

test.beforeAll(async () => {
  [developer, technology] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      {
        version: "2.0.0",
        significance: "featured",
        origin: "detected",
        status: "ready",
        notes: "# 2.0.0\n\nThe default export is gone.",
        actionRequired: true,
        publishedAt: daysAgo(3),
        summary: {
          title: "The default export is gone in 2.0.0.",
          keyPoints: [
            { text: "The default export is gone.", quote: "The default export is gone." },
            { text: "Named exports cover the same surface." },
            { text: "No other API changed." },
          ],
          breakingChanges: [{ change: "The default export is gone", migration: "Use the named export." }],
          actionRequired: true,
        },
      },
      { version: "1.9.0", significance: "notable", origin: "detected", status: "ready", notes: "Adds a flag.", actionRequired: false, publishedAt: daysAgo(8) },
    ]),
  ]);
});

test.afterAll(async () => {
  await developer.clearFollows();
  await Promise.all([developer.remove(), technology.remove()]);
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

// Tab until the element has focus, the way a visitor without a pointer reaches it. A step that never
// arrives is the failure: the element is out of the tab order, or behind something that traps it.
async function tabTo(page: Page, target: Locator, what: string, limit = 60): Promise<void> {
  await expect(target).toBeVisible();
  for (let step = 0; step < limit; step += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`the keyboard never reached ${what} in ${limit} steps`);
}

// The global rule is `:focus-visible { outline: 2px solid var(--focus) }`. Whatever the keyboard
// lands on must draw it: an outline removed by a component is what this catches.
async function expectFocusRing(page: Page, what: string): Promise<void> {
  const ring = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
  });
  expect(ring, `${what} has no focused element`).not.toBeNull();
  expect(ring?.style, `the focus ring on ${what}`).not.toBe("none");
  expect(ring?.width, `the focus ring on ${what}`).not.toBe("0px");
}

test("the skip link is the first stop and lands on the content", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`);
  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expectFocusRing(page, "the skip link");
  await skip.press("Enter");
  await expect(page).toHaveURL(new RegExp("#content$"));
});

test("reading a Release: from the list to the notes it quotes", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`);

  const version = page.getByRole("link", { name: "2.0.0", exact: true }).first();
  await tabTo(page, version, "the 2.0.0 release link");
  await expectFocusRing(page, "a release link");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/technologies/${technology.slug}/2.0.0`);
  await expect(page.locator("#verdict")).toContainText("action required");

  // The release notes are folded: the keyboard opens the panel and reads the source below.
  const notes = page.locator("#release-notes > summary");
  await tabTo(page, notes, "the release-notes panel");
  await expectFocusRing(page, "the release-notes panel");
  await page.keyboard.press("Enter");
  await expect(page.locator("#release-notes")).toHaveAttribute("open", "");
  await expect(page.locator("#release-notes ol li").first()).toBeVisible();
});

test("the Upgrade Path: the form is filled and submitted with the keyboard", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}`);

  const from = page.locator("#from");
  await tabTo(page, from, "the Upgrade from field");
  await expectFocusRing(page, "the Upgrade from field");
  await page.keyboard.type("1.9.0");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(`/technologies/${technology.slug}?from=1.9.0`);
  await expect(page.locator("#path-verdict")).toBeVisible();
});

test("the invalid version is announced and its way out is on the keyboard path", async ({ page }) => {
  await page.goto(`/technologies/${technology.slug}?from=9.9.9`);

  const message = page.locator("#from-message");
  await expect(message).toBeVisible();
  await expect(page.locator("#from")).toHaveAttribute("aria-describedby", "from-message");
  await expect(page.locator("#from")).toHaveAttribute("aria-invalid", "true");

  const from = page.locator("#from");
  await tabTo(page, from, "the Upgrade from field");
  await expectFocusRing(page, "the Upgrade from field after a refusal");
});

test("Following: the toggle is reached and flipped with the keyboard", async ({ page }) => {
  await signIn(page);
  await developer.clearFollows();
  await page.goto("/technologies");

  // The filter is the keyboard's way into a long list: it narrows to one row, and the toggle for
  // that row is the next stop.
  const filter = page.locator("#filter");
  await tabTo(page, filter, "the filter field");
  await expectFocusRing(page, "the filter field");
  await page.keyboard.type(technology.name);

  const toggle = page.getByRole("button", { name: `Follow ${technology.name}` });
  await tabTo(page, toggle, "the Follow toggle", 20);
  await expectFocusRing(page, "the Follow toggle");
  await page.keyboard.press("Enter");

  const following = page.getByRole("button", { name: `Unfollow ${technology.name}` });
  await expect(following).toHaveAttribute("aria-pressed", "true");
  await expect(following).toBeFocused();
});

test("Following from the Technology page, then on to the Dashboard", async ({ page }) => {
  await signIn(page);
  await developer.clearFollows();
  await page.goto(`/technologies/${technology.slug}`);

  const toggle = page.getByRole("button", { name: `Follow ${technology.name}` });
  await tabTo(page, toggle, "the Follow toggle");
  await expectFocusRing(page, "the Follow toggle");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: `Unfollow ${technology.name}` })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // The Dashboard is read on the server, which the press has not reached yet.
  await followWritten(page.getByRole("button", { name: `Unfollow ${technology.name}` }));
  await page.goto("/dashboard");
  const spotlight = page.getByRole("link", { name: technology.name }).first();
  await tabTo(page, spotlight, "the Technology link in the Dashboard");
  await expectFocusRing(page, "a Dashboard row link");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/technologies/${technology.slug}`);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the caret under a cited span does not draw, and the panel does not swing", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}/2.0.0`);

    // The caret only draws under the span a cite pointer has just opened, so the pointer comes first.
    await page.getByRole("link", { name: "release-notes:3" }).first().click();
    const cited = page.locator("#L3 .cited-span");
    await expect(cited).toBeVisible();
    const animation = await cited.evaluate((element) => getComputedStyle(element, "::after").animationName);
    expect(animation, "the caret animation under a cited span").toBe("none");

    // `transition-none` drops the property, not the duration: what is left has nothing to animate.
    const chevron = page.locator("#release-notes > summary svg").first();
    const property = await chevron.evaluate((element) => getComputedStyle(element).transitionProperty);
    expect(property, "the chevron transition").toBe("none");
  });
});
