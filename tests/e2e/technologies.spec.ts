import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

let developer: FixtureDeveloper;
let technology: FixtureTechnology;

test.beforeAll(async () => {
  [developer, technology] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
    ]),
  ]);
});

test.afterAll(async () => {
  await Promise.all([developer.remove(), technology.remove()]);
});

// page.request shares the browser context cookie jar, so the session lands in the browser.
async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

function toggle(page: Page, action: "Follow" | "Unfollow"): Locator {
  return page.getByRole("button", { name: `${action} ${technology.name}`, exact: true });
}

// The announced form of the count, the one an assistive technology reads.
function followed(page: Page): Locator {
  return page.getByTestId("follow-status");
}

function section(page: Page, name: "following" | "catalog" | "retired"): Locator {
  return page.getByRole("region", { name: new RegExp(`^${name} `) });
}

function rows(page: Page): Locator {
  return page.getByRole("region", { name: /^(following|catalog|retired) / }).getByRole("listitem");
}

test.beforeEach(async ({ page }) => {
  await developer.clearFollows();
  await signIn(page);
});

test("a Developer follows a Technology, and the follow is still there after a reload", async ({ page }) => {
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(/^you follow 0 of \d+ technologies$/);
  await expect(
    section(page, "catalog").getByRole("link", { name: technology.name, exact: true }),
  ).toHaveAttribute("href", `/technologies/${technology.slug}`);

  await toggle(page, "Follow").click();
  // The row answers at once, and it stays in the section where the visit found it.
  await expect(toggle(page, "Unfollow")).toHaveAttribute("aria-pressed", "true");
  await expect(followed(page)).toHaveText(/^you follow 1 of \d+ technologies$/);
  await expect(section(page, "catalog").getByRole("button", { name: `Unfollow ${technology.name}` })).toBeVisible();

  await page.reload();
  await expect(followed(page)).toHaveText(/^you follow 1 of \d+ technologies$/);
  await expect(section(page, "following").getByRole("button", { name: `Unfollow ${technology.name}` })).toBeVisible();
});

test("a Developer unfollows a Technology and it stays unfollowed after a reload", async ({ page }) => {
  await page.goto("/technologies");
  await toggle(page, "Follow").click();
  await expect(followed(page)).toHaveText(/^you follow 1 of \d+ technologies$/);

  await toggle(page, "Unfollow").click();
  await expect(toggle(page, "Follow")).toHaveAttribute("aria-pressed", "false");
  await expect(followed(page)).toHaveText(/^you follow 0 of \d+ technologies$/);

  await page.reload();
  await expect(followed(page)).toHaveText(/^you follow 0 of \d+ technologies$/);
  await expect(toggle(page, "Follow")).toBeVisible();
});

test("the filter narrows the rows, counts the matches and says when nothing matches", async ({ page }) => {
  await page.goto("/technologies");
  const matches = page.locator("#matches");
  const total = Number(/^(\d+) technologies$/.exec((await matches.textContent()) ?? "")?.[1]);
  expect(total).toBeGreaterThan(1);

  const filter = page.getByRole("searchbox", { name: "filter" });
  await filter.fill(technology.name);
  await expect(matches).toHaveText(`1 of ${total} match`);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);

  await filter.fill("not-a-technology");
  await expect(matches).toHaveText(`0 of ${total} match`);
  await expect(rows(page)).toHaveCount(0);
  // The Catalog is curated: the note names the query and offers no form and no link.
  const noMatch = page.locator("section", { hasText: "The catalog is curated" });
  await expect(noMatch).toBeVisible();
  await expect(noMatch).toContainText("no technology matches");
  await expect(noMatch).toContainText("not-a-technology");
  await expect(noMatch.getByRole("link")).toHaveCount(0);
  await expect(noMatch.locator("form")).toHaveCount(0);
});
