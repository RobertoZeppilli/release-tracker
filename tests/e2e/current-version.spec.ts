import { expect, type Page, test } from "@playwright/test";
import {
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

let developer: FixtureDeveloper;
let technology: FixtureTechnology;

const TODAY = /\d{4}-\d{2}-\d{2}/;

test.beforeAll(async () => {
  [developer, technology] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "First.", actionRequired: false },
      { version: "1.1.0", significance: "notable", origin: "imported", status: "ready", notes: "Breaking.", actionRequired: true },
      { version: "1.1.1", significance: "digest", origin: "imported", status: "skipped", notes: "A fix." },
      { version: "2.0.0", significance: "featured", origin: "detected", status: "pending", notes: "Soon." },
    ]),
  ]);
});

test.afterAll(async () => {
  // A followed Technology cannot be deleted, so the follows go first.
  await developer.clearFollows();
  await Promise.all([developer.remove(), technology.remove()]);
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

function field(page: Page) {
  return page.getByLabel("Version in use", { exact: true });
}

// The Toggle is a button only once the browser knows a Developer is looking, so waiting for it is
// waiting for the session and the follows. `networkidle` would be the wrong wait: a signed-in page
// keeps talking (analytics, the token refresh), so the network never falls silent for long enough.
async function follow(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: `Follow ${technology.name}`, exact: true });
  await expect(toggle).toBeVisible();
  await toggle.click();
}

async function declare(page: Page, version: string): Promise<void> {
  await field(page).fill(version);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#current-version-note")).toContainText("declared on");
}

test.describe("the Version in use", () => {
  test.beforeEach(async ({ page }) => {
    await developer.clearFollows();
    await signIn(page);
  });

  test("is declared from the Technology page and becomes the start of the Upgrade Path", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);
    await follow(page);
    await expect(page.getByText("not declared")).toBeVisible();

    await field(page).fill("1.0.0");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    // The day of the declaration is on the screen, next to the counts built on it.
    await expect(page.locator("#current-version-note")).toHaveText(
      new RegExp(`declared on ${TODAY.source}, and the upgrade path below starts from it`),
    );
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.0.0");
    await expect(page.getByLabel("Upgrade from")).toHaveAccessibleDescription(
      new RegExp(`starting from 1\.0\.0, the version you declared in use on ${TODAY.source}\.`),
    );
    await expect(page.getByRole("heading", { name: "warning: 1 needs action" })).toBeVisible();

    // And it is still the start on the next visit, without anything in the URL.
    await page.reload();
    await expect(page).toHaveURL(`/technologies/${technology.slug}`);
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.0.0");
  });

  test("is not touched by `?from=`, which is a single look", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);
    await follow(page);
    await declare(page, "1.0.0");

    await page.goto(`/technologies/${technology.slug}?from=1.1.1`);
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.1.1");
    await expect(page.getByRole("heading", { name: "note: 1 to check" })).toBeVisible();
    // The saved declaration is untouched: the field still holds it, and so does the path once the
    // query string is gone.
    await expect(field(page)).toHaveValue("1.0.0");

    await page.goto(`/technologies/${technology.slug}`);
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.0.0");
  });

  test("is refused when it is newer than the latest stable Release, and can be taken away", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);
    await follow(page);

    await field(page).fill("3.0.0");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(field(page)).toHaveAttribute("aria-invalid", "true");
    await expect(field(page)).toHaveAccessibleDescription(
      "error: 3.0.0 is newer than 2.0.0, the latest stable release.",
    );

    await declare(page, "1.0.0");

    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(page.getByText("not declared")).toBeVisible();
    // With nothing declared the page is back to the plain list of Releases.
    await expect(page.getByLabel("Upgrade from")).toHaveValue("");
    await expect(page.getByRole("heading", { name: /needs action|up to date/ })).toHaveCount(0);
  });

  test("tells the Dashboard how far behind a followed Technology is, and since when", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);
    await follow(page);
    await declare(page, "1.0.0");

    await page.goto("/dashboard");
    await expect(page.getByText(new RegExp(`In use on 1 of 1: 3 releases behind · 1 needs action · oldest declared ${TODAY.source}\.`))).toBeVisible();
    const entry = page.getByRole("region", { name: /spotlight/ }).getByRole("listitem").filter({ hasText: technology.name });
    await expect(entry).toContainText(new RegExp(`in use 1\.0\.0 since ${TODAY.source} · 3 releases behind 2\.0\.0 · 1 needs action`));
  });
});
