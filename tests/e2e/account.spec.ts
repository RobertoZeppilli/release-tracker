import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
  countFollows,
  declareCurrentVersion,
  developerExists,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

// A Developer of its own per test: three of these tests end with the account deleted, so a shared
// one would take the rest of the file with it.
async function signedIn(page: Page): Promise<FixtureDeveloper> {
  const developer = await seedDeveloper();
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
  return developer;
}

// Deleting an account that is already gone is an error, and a test that deleted it on purpose is not
// a test that failed to clean up.
async function discard(developer: FixtureDeveloper): Promise<void> {
  if (await developerExists(developer.id)) await developer.remove();
}

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([{ version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false }]);
});

test.afterAll(async () => {
  await technology.remove();
});

test.describe("the account page", () => {
  test("is behind the login, like the other signed-in pages", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL("/login?next=%2Faccount");
  });

  test("counts what the account really holds, and is reached from the account menu", async ({ page }) => {
    const developer = await signedIn(page);
    await addFollows(developer.id, [technology.id]);
    await declareCurrentVersion(developer.id, technology.id, "1.0.0");

    await page.goto("/dashboard");
    await page.getByRole("button", { name: /^Account/ }).click();
    await page.getByRole("link", { name: "account" }).click();
    await expect(page).toHaveURL("/account");

    await expect(page.getByRole("heading", { name: "Account", level: 1 })).toBeVisible();
    await expect(page.getByText(developer.email)).toBeVisible();
    await expect(page.getByText("1 of 10")).toBeVisible();
    // The list of what goes names the same two numbers the page read above it.
    await expect(page.getByText("1 followed technology")).toBeVisible();
    await expect(page.getByText("1 declared version in use")).toBeVisible();

    // The one thing the deletion cannot reach, with the shortest address this app can build for it.
    // Without NEXT_PUBLIC_GITHUB_CLIENT_ID it is the list of authorised applications, which is what
    // the test environment has.
    await expect(page.getByRole("link", { name: "revoke it on GitHub" })).toHaveAttribute(
      "href",
      /^https:\/\/github\.com\/settings\/(applications|connections\/applications\/)/,
    );

    await discard(developer);
  });

  test("deletes nothing when the word is wrong, and says so", async ({ page }) => {
    const developer = await signedIn(page);
    await addFollows(developer.id, [technology.id]);

    await page.goto("/account");
    await page.getByLabel(/type delete to confirm/).fill("cancella");
    await page.getByRole("button", { name: "Delete account" }).click();

    await expect(page).toHaveURL("/account?error=confirm");
    // By id, not by role: the production build carries Next's own route announcer, which is a
    // second `role="alert"` on the page.
    await expect(page.locator("#confirm-note")).toContainText("Nothing was deleted");
    expect(await developerExists(developer.id)).toBe(true);
    expect(await countFollows(developer.id)).toBe(1);

    await discard(developer);
  });

  test("deletes the account, its follows and the session, and says where that leaves the reader", async ({ page }) => {
    const developer = await signedIn(page);
    await addFollows(developer.id, [technology.id]);
    await declareCurrentVersion(developer.id, technology.id, "1.0.0");

    await page.goto("/account");
    await page.getByLabel(/type delete to confirm/).fill("delete");
    await page.getByRole("button", { name: "Delete account" }).click();

    await expect(page).toHaveURL("/login?deleted=1");
    await expect(page.getByRole("status")).toContainText("that account is gone");

    // The database, not the page: the row is gone and the cascade took the follow with it.
    expect(await developerExists(developer.id)).toBe(false);
    expect(await countFollows(developer.id)).toBe(0);

    // The cookies went with it, so the signed-in pages are behind the login again.
    await page.goto("/account");
    await expect(page).toHaveURL("/login?next=%2Faccount");
  });

  test("refuses a post that arrives without a session", async ({ page }) => {
    const response = await page.request.post("/auth/delete-account", {
      form: { confirm: "delete" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    expect(response.headers().location).toContain("/login?next=%2Faccount");
  });
});
