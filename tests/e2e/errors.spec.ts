import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// Issue #25: the 404 and the generic error page. The status code is checked as well as the markup,
// because `notFound()` can only set it while the response has not started streaming: once a
// Suspense boundary has rendered, the page says 404 and the header says 200.

const PHONE = { width: 390, height: 844 };

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "2.0.0", significance: "featured", origin: "detected", status: "ready", notes: "# 2.0.0\n\nA note.", actionRequired: false },
  ]);
});

test.afterAll(async () => {
  await technology.remove();
});

test("an address that matches no route answers 404 with the note line", async ({ page }) => {
  const response = await page.goto("/nothing-here");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no page at this address");
  // A 404 is the absence of a thing, not a failure: no severity ink on the line.
  await expect(page.getByRole("heading", { level: 1 }).locator(".text-breaking")).toHaveCount(0);
});

test("an unknown technology slug answers 404", async ({ page }) => {
  const response = await page.goto("/technologies/not-a-technology");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no page at this address");
});

test("a version with no release of its own answers 404", async ({ page }) => {
  const response = await page.goto(`/technologies/${technology.slug}/9.9.9`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no page at this address");
});

test("a version segment that is not a version answers 404", async ({ page }) => {
  const response = await page.goto(`/technologies/${technology.slug}/not-a-version`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no page at this address");
});

test("the 404 is no dead end, at 390px either", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/technologies/not-a-technology");

  const sections = page.getByRole("navigation", { name: "Sections" });
  await expect(sections.getByRole("link", { name: "dashboard" })).toBeVisible();
  await expect(sections.getByRole("link", { name: "technologies" })).toBeVisible();

  await page.getByRole("link", { name: "browse the catalog" }).click();
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent("/technologies")}`);
});

test("a page that fails shows the error page, with a way to try again and no internal detail", async ({ page }) => {
  await page.goto("/test/throw");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText("error: this page could not be loaded");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

  // The message of the thrown error, and anything that looks like a stack, stay on the server.
  const body = await page.locator("body").innerText();
  expect(body).not.toContain("deliberate failure");
  expect(body).not.toContain("src/app/test/throw");
  expect(body).not.toMatch(/\bat \w+ \(/);

  await expect(page.getByRole("link", { name: "browse the catalog" })).toBeVisible();
});

test("the Try again button is on the keyboard path, and retrying lands somewhere defined", async ({ page }) => {
  await page.goto("/test/throw");
  const retry = page.getByRole("button", { name: "Try again" });

  for (let stop = 0; stop < 12 && !(await retry.evaluate((node) => node === document.activeElement)); stop += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(retry).toBeFocused();

  // Retrying renders the same failing page again, so the honest answer is the error page itself.
  await retry.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("error:");
});
