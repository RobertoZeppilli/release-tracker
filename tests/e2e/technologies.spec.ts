import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  addFollows,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureFillers,
  type FixtureTechnology,
  retireTechnology,
  seedDeveloper,
  seedFillers,
  seedTechnology,
} from "./fixtures";

const FREE_LIMIT = 10;

let developer: FixtureDeveloper;
let technology: FixtureTechnology;
// Its own Technology, because retiring one is not undone.
let leaving: FixtureTechnology;
let fillers: FixtureFillers;

test.beforeAll(async () => {
  const release = [
    { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
  ] as const;
  [developer, technology, leaving, fillers] = await Promise.all([
    seedDeveloper(),
    seedTechnology([...release]),
    seedTechnology([...release]),
    seedFillers(FREE_LIMIT),
  ]);
});

test.afterAll(async () => {
  await Promise.all([developer.remove(), technology.remove(), leaving.remove(), fillers.remove()]);
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

test("at ten of ten the other toggles are blocked, still reachable, and say why", async ({ page }) => {
  await addFollows(developer.id, fillers.ids);
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT} of ${FREE_LIMIT} technologies`);

  const note = page.locator("#limit-note");
  await expect(note).toBeVisible();
  await expect(note).toContainText("unfollow one to follow another");
  // Nothing about a paid Plan: the remedy is in the Developer's hands.
  await expect(note).not.toContainText(/pro/i);

  const blocked = toggle(page, "Follow");
  await expect(blocked).toHaveAttribute("aria-disabled", "true");
  await expect(blocked).toHaveAttribute("aria-describedby", /limit-note/);
  // Blocked, not disabled: the keyboard still gets there and the note is read with it.
  await blocked.focus();
  await expect(blocked).toBeFocused();
  // `force` because Playwright refuses to click an `aria-disabled` button, which is the point.
  await blocked.click({ force: true });
  await expect(blocked).toHaveAttribute("aria-pressed", "false");
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT} of ${FREE_LIMIT} technologies`);

  // Room again: the note goes with the block.
  await section(page, "following").getByRole("button", { name: /^Unfollow / }).first().click();
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of ${FREE_LIMIT} technologies`);
  await expect(note).toBeHidden();
  await expect(blocked).not.toHaveAttribute("aria-disabled", "true");
});

test("a follow the database refuses puts the row back and says what to do", async ({ page }) => {
  await addFollows(developer.id, fillers.ids.slice(0, FREE_LIMIT - 1));
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of ${FREE_LIMIT} technologies`);

  // The tenth arrives from another session, so this page still believes there is room.
  await addFollows(developer.id, fillers.ids.slice(FREE_LIMIT - 1));
  await toggle(page, "Follow").click();

  const error = page.locator(`#err-${technology.slug}`);
  await expect(error).toBeVisible();
  await expect(error).toContainText("not followed");
  await expect(error).toContainText("unfollow one to follow another");
  await expect(error).not.toContainText(/pro/i);

  const back = toggle(page, "Follow");
  await expect(back).toHaveAttribute("aria-pressed", "false");
  await expect(back).toHaveAttribute("aria-describedby", new RegExp(`err-${technology.slug}`));
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of ${FREE_LIMIT} technologies`);
});

test("a retired Technology can only be unfollowed, and the row says so", async ({ page }) => {
  await addFollows(developer.id, [leaving.id]);
  await retireTechnology(leaving.id);
  await page.goto("/technologies");

  const retired = section(page, "retired");
  await expect(retired).toContainText("They still count toward your 10");
  const row = retired.getByRole("listitem").filter({ hasText: leaving.name });
  await expect(row).toContainText("retired");

  await row.getByRole("button", { name: `Unfollow ${leaving.name}` }).click();
  await expect(row).toContainText("can't be followed again");
  await expect(row.getByRole("button")).toHaveCount(0);
  await expect(followed(page)).toHaveText(`you follow 0 of ${FREE_LIMIT} technologies`);

  // And it is gone on the next visit, because nobody follows it any more.
  await page.reload();
  await expect(page.getByRole("link", { name: leaving.name, exact: true })).toHaveCount(0);
});
