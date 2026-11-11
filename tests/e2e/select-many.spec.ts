import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  arrived,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  retireTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

let developer: FixtureDeveloper;
// Three Technologies of this test's own, so a group can be built out of rows no other case presses.
let one: FixtureTechnology;
let two: FixtureTechnology;
let three: FixtureTechnology;

test.beforeAll(async () => {
  const release = [
    { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
  ] as const;
  [developer, one, two, three] = await Promise.all([
    seedDeveloper(),
    seedTechnology([...release]),
    seedTechnology([...release]),
    seedTechnology([...release]),
  ]);
});

test.afterAll(async () => {
  await Promise.all([developer.remove(), one.remove(), two.remove(), three.remove()]);
});

// Each case starts from a Developer following nothing: a leftover follow from the case before would
// put a row on the other side of the split.
test.beforeEach(async () => {
  await developer.clearFollows();
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

async function open(page: Page): Promise<void> {
  await signIn(page);
  await page.goto("/technologies");
  await arrived(page);
}

function selectMany(page: Page): Locator {
  return page.getByRole("button", { name: "select many", exact: true });
}

function mark(page: Page, of: FixtureTechnology): Locator {
  return page.getByRole("checkbox", { name: `Select ${of.name}`, exact: true });
}

function stack(page: Page): Locator {
  return page.getByRole("region", { name: "what you follow, by name" });
}

test.describe("following several Technologies at once", () => {
  test("the mode is off until it is asked for, and Escape leaves it", async ({ page }) => {
    await open(page);
    await expect(mark(page, one)).toHaveCount(0);

    await selectMany(page).click();
    await expect(mark(page, one)).toBeVisible();
    await expect(selectMany(page)).toHaveAttribute("aria-pressed", "true");

    await mark(page, one).click();
    await expect(page.getByRole("button", { name: "Follow 1", exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(mark(page, one)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Follow 1", exact: true })).toHaveCount(0);
  });

  test("the bar stays on the screen when the selection is made far down the list", async ({ page }) => {
    await open(page);
    await selectMany(page).click();
    await mark(page, one).click();

    const follow = page.getByRole("button", { name: "Follow 1", exact: true });
    await page.mouse.wheel(0, 1200);
    // ⚠️ Measured, not asserted on a class: `top-0` is not generated in this project, so a sticky
    // bar can read as sticky in the markup and stick to nothing (see `selection-bar.tsx`).
    await expect(async () => {
      const box = await follow.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect(box?.y ?? Infinity).toBeLessThan(page.viewportSize()?.height ?? 0);
    }).toPass();
  });

  test("a group the plan has room for is followed in one press", async ({ page }) => {
    await open(page);
    await selectMany(page).click();
    await mark(page, one).click();
    await mark(page, two).click();

    const follow = page.getByRole("button", { name: "Follow 2", exact: true });
    await expect(follow).not.toHaveAttribute("aria-disabled", "true");
    // ⚠️ The optimistic answer takes both rows across the split at once, so the bar is gone before
    // the database has replied and there is no control left to read `aria-busy` from. The write
    // itself is what the reload below has to come after, so the write is what is waited for.
    const written = page.waitForResponse(
      (response) => response.url().includes("/rest/v1/follows") && response.request().method() === "POST",
    );
    await follow.click();
    await written;

    // Both rows crossed the split, and the selection emptied itself with them: the bar is gone.
    await expect(stack(page).getByRole("link", { name: one.name, exact: true })).toBeVisible();
    await expect(stack(page).getByRole("link", { name: two.name, exact: true })).toBeVisible();
    await expect(page.getByText(/\d+ selected/)).toHaveCount(0);

    // And the database holds them, not just the optimistic cache.
    await page.reload();
    await arrived(page);
    await expect(stack(page).getByRole("link", { name: one.name, exact: true })).toBeVisible();
    await expect(stack(page).getByRole("link", { name: two.name, exact: true })).toBeVisible();
  });

  test("a group the database refuses puts every row back and says why", async ({ page }) => {
    // A fourth Technology, which leaves the Catalog while the page is open: the page cannot know,
    // and Postgres takes the whole statement back, which is why the bar says `none followed`
    // instead of counting which rows made it (issue #126, DESIGN.md, Selection Bar).
    const leaving = await seedTechnology([]);
    await open(page);
    await selectMany(page).click();
    await mark(page, one).click();
    await mark(page, two).click();
    await mark(page, leaving).click();

    await retireTechnology(leaving.id);
    await page.getByRole("button", { name: "Follow 3", exact: true }).click();

    await expect(
      page.getByText("error: none followed. one of them has left the catalog, so clear it from the selection."),
    ).toBeVisible();
    await expect(stack(page).getByRole("link", { name: one.name, exact: true })).toHaveCount(0);
    await expect(stack(page).getByRole("link", { name: two.name, exact: true })).toHaveCount(0);
    await expect(mark(page, one)).toHaveAttribute("aria-checked", "true");
    await leaving.remove();
  });

  test("the single Follow keeps working inside the mode, and leaves the selection alone", async ({ page }) => {
    await open(page);
    await selectMany(page).click();
    await mark(page, one).click();

    const single = page.getByRole("button", { name: `Follow ${two.name}`, exact: true });
    await single.click();
    await expect(stack(page).getByRole("link", { name: two.name, exact: true })).toBeVisible();

    // The row that was chosen is untouched by the row that was followed beside it.
    await expect(mark(page, one)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("button", { name: "Follow 1", exact: true })).toBeVisible();
  });
});
