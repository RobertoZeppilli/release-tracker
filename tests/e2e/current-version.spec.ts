import { expect, type Page, test } from "@playwright/test";
import {
  e2eAuthSecret,
  followWritten,
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
  // Everything below is written on the follow, so the press is not enough: without this wait the
  // declaration can reach the database first and come back as "was not saved".
  await followWritten(page.getByRole("button", { name: `Unfollow ${technology.name}`, exact: true }));
}

async function declare(page: Page, version: string): Promise<void> {
  await field(page).fill(version);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  // The date, not the word alone: `not declared` contains `declared`, so a looser assertion would
  // pass on the state this helper is waiting to leave.
  await expect(page.locator("#current-version-note")).toHaveText(new RegExp(`declared ${TODAY.source}`));
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

    // The day of the declaration is on the screen, in the panel row that carries the version and
    // right above the `from` that repeats it. The prose that used to say so under the `from` field
    // is gone with it: two lines named the same version and the same day 100px apart (issue #113).
    await expect(page.locator("#current-version-note")).toHaveText(new RegExp(`declared ${TODAY.source}`));
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.0.0");
    await expect(page.getByLabel("Upgrade from")).toHaveAccessibleDescription("");
    // Both controls are rows of one panel (issue #113): the declaration is no longer a line under
    // the header facts, and this fails if it goes back there.
    const panel = page.getByRole("region", { name: "upgrade path" });
    await expect(panel.getByLabel("Version in use", { exact: true })).toBeVisible();
    await expect(panel.getByLabel("Upgrade from")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "note: 1 without a verdict" })).toBeVisible();
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
    // With nothing declared the path falls back to the start the page derives on its own.
    await expect(page.getByLabel("Upgrade from")).toHaveValue("1.1.1");
    await expect(page.getByLabel("Upgrade from")).toHaveAccessibleDescription(
      "note: starting from 1.1.1, the last release of the previous major, because no version was given.",
    );
  });

  test("tells the Dashboard how far behind a followed Technology is, and since when", async ({ page }) => {
    await page.goto(`/technologies/${technology.slug}`);
    await follow(page);
    await declare(page, "1.0.0");

    await page.goto("/dashboard");
    // DESIGN.md, In Use Line: one place says it, the Standing Row's own words, and the day of the
    // declaration is said once for the whole page, in the totals under the list.
    const row = page
      .getByRole("group", { name: "Followed technologies, by distance" })
      .getByRole("link")
      .filter({ hasText: technology.name });
    await expect(row).toContainText("1 needs action");
    await expect(page.getByText("3 releases behind in all")).toBeVisible();
    await expect(page.getByText(new RegExp(`oldest version declared ${TODAY.source}`))).toBeVisible();
  });
});
