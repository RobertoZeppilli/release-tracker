import { expect, type Page, test } from "@playwright/test";
import { e2eAuthSecret, type FixtureDeveloper, seedDeveloper } from "./fixtures";

let developer: FixtureDeveloper;

test.beforeAll(async () => {
  developer = await seedDeveloper();
});

test.afterAll(async () => {
  await developer.remove();
});

// page.request shares the browser context cookie jar, so the session lands in the browser.
async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

test.describe("a Visitor", () => {
  test("is sent to the login from the dashboard and comes back after signing in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login?next=%2Fdashboard");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await signIn(page);
    await page.goto("/login?next=%2Fdashboard");
    await expect(page).toHaveURL("/dashboard");
    // The Dashboard shows no email: what says the Developer is in are the signed-in controls.
    await openAccount(page);
    await expect(page.getByRole("button", { name: "sign out" })).toBeVisible();
    await expect(page.getByLabel("Followed technologies")).toBeVisible();
  });

  test("is sent to the login from the technologies page", async ({ page }) => {
    await page.goto("/technologies");
    await expect(page).toHaveURL("/login?next=%2Ftechnologies");
  });

  test("keeps reading the public pages without signing in", async ({ page }) => {
    const response = await page.goto("/technologies/vite");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL("/technologies/vite");
  });

  test("is not carried off the site by a crafted next", async ({ page }) => {
    await signIn(page);
    await page.goto("/login?next=https%3A%2F%2Fevil.test");
    await expect(page).toHaveURL("/dashboard");
  });
});

// Only for local development, where GitHub OAuth is off: the button exists while DEV_LOGIN_EMAIL
// and DEV_LOGIN_PASSWORD are set, which is never in CI and never in production.
test.describe("the local way in", () => {
  test("signs a Developer in from the login page and takes them where they were going", async ({ page }) => {
    await page.goto("/login?next=%2Ftechnologies");
    const button = page.getByRole("button", { name: "Continue as local developer" });
    test.skip((await button.count()) === 0, "DEV_LOGIN_EMAIL is not set: run pnpm dev:login");

    await button.click();
    await expect(page).toHaveURL("/technologies");
    await openAccount(page);
    await expect(page.getByRole("button", { name: "sign out" })).toBeVisible();
  });
});

// The Severity Pairing Rule: the one inked line on this screen was colour alone, the only one in the
// app, on the screen where a message has to be unambiguous. The glyph is `aria-hidden`, so what the
// assertion can see of it is the `<svg>` the label carries with it.
test("a refused sign in says so with a glyph and a label, not with colour alone", async ({ page }) => {
  await page.goto("/login?error=denied");
  // Scoped to `main`: Next's route announcer is a `role="alert"` of its own, and it joins the page as
  // soon as a client navigation has happened once, so an unscoped role query is green alone and red
  // in the suite.
  const alert = page.locator("main").getByRole("alert");
  await expect(alert).toContainText("error:");
  await expect(alert).toContainText("the sign in was cancelled");
  expect(await alert.locator("svg").count(), "the severity glyph").toBe(1);
});

// `max-w-measure` is the 72ch prose cap. This line had none and ran to 88ch at 1280px: the token
// works wherever it is, and the two long lines of the critique were the elements without it.
test("the login keeps its prose inside the measure", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/login");
  const line = page.getByText("Asks GitHub only for your public profile");
  const widest = await line.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:${style.fontFamily};font-size:${style.fontSize};font-weight:${style.fontWeight}`;
    probe.textContent = "0";
    document.body.append(probe);
    const ch = probe.getBoundingClientRect().width;
    probe.remove();
    return node.getBoundingClientRect().width / ch;
  });
  expect(widest, "the width of the line in characters").toBeLessThanOrEqual(72);
});

// The account panel: what belongs to the viewer rather than to the page. It opens from the picture
// at the right of the bar, and since issue #119 it holds the way out and nothing else, because the
// two destinations are in the bar on every page.
async function openAccount(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Account/ }).click();
}

test.describe("a Developer", () => {
  test("sees the signed-in navigation and can sign out", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard");

    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "dashboard" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "technologies" })).toBeVisible();

    await openAccount(page);
    await page.getByRole("button", { name: "sign out" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login?next=%2Fdashboard");
  });

  test("is offered the login from a public page, and the sign out once in", async ({ page }) => {
    await page.goto("/technologies/vite");
    await expect(page.getByRole("link", { name: "sign in" })).toBeVisible();

    await signIn(page);
    await page.goto("/technologies/vite");
    await openAccount(page);
    await expect(page.getByRole("button", { name: "sign out" })).toBeVisible();
  });

  // The reclaim of issue #119: from a Technology page the `dashboard` link existed only inside the
  // account panel, so it took one click to reveal and another to follow, and a reader who did not
  // know the picture hid links saw none. One visible gesture, with nothing opened first.
  test("reaches the Dashboard from a public page in one visible gesture", async ({ page }) => {
    await signIn(page);
    await page.goto("/technologies/vite");

    const sections = page.getByRole("navigation", { name: "Sections" });
    await expect(sections.getByRole("link", { name: "dashboard" })).toBeVisible();
    await sections.getByRole("link", { name: "dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  // A visitor sees the same two links and is not told they are off limits: both sit behind sign-in,
  // and following one lands on sign-in with the destination kept, exactly as the `technologies`
  // breadcrumb step already did. The header cannot branch on the viewer anyway, since the session
  // arrives after the first paint.
  test("is sent to sign in, and back, when following a section as a visitor", async ({ page }) => {
    await page.goto("/technologies/vite");

    const sections = page.getByRole("navigation", { name: "Sections" });
    await sections.getByRole("link", { name: "dashboard" }).click();
    await expect(page).toHaveURL(`/login?next=${encodeURIComponent("/dashboard")}`);
  });
});
