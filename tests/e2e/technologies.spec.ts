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

// The Catalog is read by Category: ten groups instead of one long alphabetical list (issue #86).
function group(page: Page, category: string): Locator {
  return page.getByRole("region", { name: new RegExp(`^${category} \\(`) });
}

test("the Catalog is grouped by Category, and the filter works inside the groups", async ({ page }) => {
  await page.goto("/technologies");

  // The fixture is a `library` and the fillers are a `platform`, so both groups are on the page and
  // the row sits in its own one. The Catalog keeps its own title above them.
  const library = group(page, "library");
  await expect(library.getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(group(page, "platform").getByRole("link", { name: technology.name })).toHaveCount(0);
  await expect(section(page, "catalog")).toContainText("catalog (");

  // `following` and `retired` are never grouped: the Category is the Catalog's way of being read.
  await toggle(page, "Follow").click();
  await page.reload();
  await expect(section(page, "following").getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(section(page, "following").getByRole("region")).toHaveCount(0);

  // The count of a group follows a toggle on the same tick the Catalog count does, and the row stays
  // where the visit found it until the next one.
  await developer.clearFollows();
  await page.goto("/technologies");
  const before = await library.getByRole("heading").textContent();
  const total = Number(/\((\d+)\)/.exec(before ?? "")?.[1]);
  expect(total).toBeGreaterThan(0);
  await toggle(page, "Follow").click();
  await expect(library.getByRole("heading")).toHaveText(`library (${total - 1})`);
  await expect(library.getByRole("button", { name: `Unfollow ${technology.name}` })).toBeVisible();
  await developer.clearFollows();
});

test("a filter with no match in a group hides that group, and counts over the whole Catalog", async ({ page }) => {
  await page.goto("/technologies");
  const filter = page.getByRole("searchbox", { name: "filter" });
  const matches = page.locator("#matches");
  const total = Number(/^(\d+) technologies$/.exec((await matches.textContent()) ?? "")?.[1]);

  await filter.fill(technology.name);
  // The only group left is the one holding the match; the Catalog still counts over all of itself.
  await expect(group(page, "library")).toBeVisible();
  await expect(group(page, "platform")).toBeHidden();
  await expect(matches).toHaveText(`1 of ${total} match`);
  await expect(section(page, "catalog").getByRole("heading").first()).toHaveText(/^catalog \(1 of \d+\)$/);
  await expect(rows(page)).toHaveCount(1);

  await filter.fill("");
  await expect(group(page, "platform")).toBeVisible();
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

test("the filter lands in the URL, survives a reload and leaves the history alone", async ({ page }) => {
  await page.goto("/technologies");
  const filter = page.getByRole("searchbox", { name: "filter" });
  await filter.fill(technology.name);
  await expect(rows(page)).toHaveCount(1);
  await expect(page).toHaveURL(`/technologies?${new URLSearchParams({ filter: technology.name })}`);

  await page.reload();
  await expect(filter).toHaveValue(technology.name);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);

  // Typing replaces the entry instead of adding one, so back leaves the page.
  await filter.fill("");
  await expect(page).toHaveURL("/technologies");
  await expect(rows(page).first()).toBeVisible();
  await page.goBack();
  await expect(page).not.toHaveURL(/\/technologies/);
});

test("a filtered address opened from scratch shows the same view as typing", async ({ page }) => {
  await page.goto(`/technologies?${new URLSearchParams({ filter: technology.name })}`);
  const matches = page.locator("#matches");
  await expect(matches).toHaveText(/^1 of \d+ match$/);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);
  await expect(page.getByRole("searchbox", { name: "filter" })).toHaveValue(technology.name);

  // An empty parameter is the unfiltered page.
  await page.goto("/technologies?filter=");
  await expect(matches).toHaveText(/^\d+ technologies$/);
  await expect(rows(page).first()).toBeVisible();
});

test("a filtered address that matches nothing says so, like typing it does", async ({ page }) => {
  await page.goto("/technologies?filter=not-a-technology&stray=1");
  await expect(page.locator("#matches")).toHaveText(/^0 of \d+ match$/);
  await expect(rows(page)).toHaveCount(0);
  const noMatch = page.locator("section", { hasText: "The catalog is curated" });
  await expect(noMatch).toContainText("not-a-technology");

  // An unrelated parameter is left where it was.
  await page.getByRole("searchbox", { name: "filter" }).fill("");
  await expect(page).toHaveURL("/technologies?stray=1");
});
