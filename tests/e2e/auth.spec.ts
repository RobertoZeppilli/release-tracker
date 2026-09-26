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
    await expect(page.getByTestId("developer-email")).toHaveText(developer.email);
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

test.describe("a Developer", () => {
  test("sees the signed-in navigation and can sign out", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard");

    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "dashboard" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "technologies" })).toBeVisible();

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
    await expect(page.getByRole("button", { name: "sign out" })).toBeVisible();
  });
});
