import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  addFollows,
  e2eAuthSecret,
  followWritten,
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
// One retired Technology each, because retiring one is not undone, and a follow written after the
// retirement is refused by the trigger: the order of the two cases is the opposite of each other.
let leaving: FixtureTechnology;
let gone: FixtureTechnology;
let fillers: FixtureFillers;

test.beforeAll(async () => {
  const release = [
    { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
  ] as const;
  [developer, technology, leaving, gone, fillers] = await Promise.all([
    seedDeveloper(),
    seedTechnology([...release]),
    seedTechnology([...release]),
    seedTechnology([...release], { retired: true }),
    seedFillers(FREE_LIMIT),
  ]);
});

test.afterAll(async () => {
  await Promise.all([
    developer.remove(),
    technology.remove(),
    leaving.remove(),
    gone.remove(),
    fillers.remove(),
  ]);
});

// page.request shares the browser context cookie jar, so the session lands in the browser.
async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

function toggle(page: Page, action: "Follow" | "Unfollow", of: FixtureTechnology = technology): Locator {
  return page.getByRole("button", { name: `${action} ${of.name}`, exact: true });
}

function path(of: FixtureTechnology = technology): string {
  return `/technologies/${of.slug}`;
}

test.describe("a Visitor", () => {
  test("is sent to the login by the Follow and comes back to the Technology", async ({ page }) => {
    await page.goto(path());
    const offer = page.getByRole("link", { name: `Follow ${technology.name}`, exact: true });
    await expect(offer).toBeVisible();

    await offer.click();
    await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path())}`);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    // GitHub cannot be driven from here, so the session arrives the way the callback would leave it.
    await signIn(page);
    await page.reload();
    await expect(page).toHaveURL(path());
    await expect(toggle(page, "Follow")).toBeVisible();
  });

  test("is offered no Follow on a retired Technology", async ({ page }) => {
    await page.goto(path(gone));
    await expect(page.getByRole("note")).toContainText("no longer tracked");
    await expect(page.getByRole("link", { name: /^Follow / })).toHaveCount(0);
  });
});

test.describe("a Developer", () => {
  test.beforeEach(async ({ page }) => {
    await developer.clearFollows();
    await signIn(page);
  });

  test("follows from the Technology page, and the follow is still there after a reload", async ({ page }) => {
    await page.goto(path());
    await toggle(page, "Follow").click();
    await expect(toggle(page, "Unfollow")).toHaveAttribute("aria-pressed", "true");

    // The reload reads the database, which the press has not reached yet.
    await followWritten(toggle(page, "Unfollow"));
    await page.reload();
    await expect(toggle(page, "Unfollow")).toHaveAttribute("aria-pressed", "true");

    // The cached page knows nothing about them: the state is read in the browser, per visitor.
    const html = await (await page.request.get(path())).text();
    expect(html).not.toContain("Unfollow");
    expect(html).not.toContain("Following");

    await toggle(page, "Unfollow").click();
    await expect(toggle(page, "Follow")).toHaveAttribute("aria-pressed", "false");
    await followWritten(toggle(page, "Follow"));
    await page.reload();
    await expect(toggle(page, "Follow")).toBeVisible();
  });

  test("at ten of ten the Follow is blocked, still reachable, and says why", async ({ page }) => {
    await addFollows(developer.id, fillers.ids);
    await page.goto(path());

    const blocked = toggle(page, "Follow");
    await expect(blocked).toHaveAttribute("aria-disabled", "true");
    await expect(blocked).toHaveAttribute("aria-describedby", /limit-note/);

    const note = page.locator("#limit-note");
    await expect(note).toBeVisible();
    await expect(note).toContainText("unfollow one to follow another");
    // Nothing about a paid Plan: the remedy is in the Developer's hands.
    await expect(note).not.toContainText(/pro/i);

    // Blocked, not disabled: the keyboard still gets there and the note is read with it.
    await blocked.focus();
    await expect(blocked).toBeFocused();
    // `force` because Playwright refuses to click an `aria-disabled` button, which is the point.
    await blocked.click({ force: true });
    await expect(blocked).toHaveAttribute("aria-pressed", "false");
  });

  test("can only unfollow a retired Technology, and the page says so", async ({ page }) => {
    await addFollows(developer.id, [leaving.id]);
    await retireTechnology(leaving.id);
    await page.goto(path(leaving));

    await toggle(page, "Unfollow", leaving).click();
    await expect(page.getByText("can't be followed again")).toBeVisible();
    await expect(page.getByRole("button", { name: /^(Follow|Unfollow) / })).toHaveCount(0);

    // And there is nothing to press on the next visit, because nobody follows it any more. The
    // Toggle itself is gone with the follow, so the write is waited for on the page, which keeps
    // nothing busy once it has landed.
    await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("button", { name: /^(Follow|Unfollow) / })).toHaveCount(0);
    await expect(page.getByText("can't be followed again")).toHaveCount(0);
  });
});

// DESIGN.md, The Reserved Space Rule. The public Technology page lets the query fetch the follows,
// and until it answers `isFollowing` is false for every Technology: the Toggle used to render that
// as `Follow`, on a Technology this Developer already follows. The reserved box waits instead, so
// nothing is stated before there is something true to state, and nothing moves when it arrives.
test("the Follow says nothing while the follows are still on the way", async ({ page }) => {
  await developer.clearFollows();
  await addFollows(developer.id, [technology.id]);
  await signIn(page);

  let release = () => {};
  const held = new Promise<void>((done) => {
    release = done;
  });
  // The browser reads the follows straight from the database, so holding that one request is what
  // keeps the page in the state this test is about.
  let asked = false;
  await page.route(/\/rest\/v1\/follows\?select/, async (route) => {
    asked = true;
    await held;
    await route.continue();
  });

  await page.goto(path());
  // The query only starts once the browser knows who is looking, and the Account button in the bar
  // is that moment: before it, the Toggle is waiting on the session instead and the test would be
  // measuring the wrong wait.
  await page.getByRole("button", { name: /^Account/ }).waitFor();
  await expect.poll(() => asked, { message: "the follows are read over the wire" }).toBe(true);

  // The control's place is kept, with neither state claimed.
  await expect(page.getByRole("heading", { level: 1, name: technology.name })).toBeVisible();
  await expect(toggle(page, "Follow")).toHaveCount(0);
  await expect(toggle(page, "Unfollow")).toHaveCount(0);

  release();
  await expect(toggle(page, "Unfollow")).toBeVisible();
  await expect(toggle(page, "Follow")).toHaveCount(0);
});
