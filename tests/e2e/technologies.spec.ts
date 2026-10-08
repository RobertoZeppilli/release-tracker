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
  await expect(followed(page)).toHaveText(/^you follow 0 of your \d+ free follows$/);
  await expect(
    section(page, "catalog").getByRole("link", { name: technology.name, exact: true }),
  ).toHaveAttribute("href", `/technologies/${technology.slug}`);

  await toggle(page, "Follow").click();
  // The row answers at once, and it has already moved: the section that holds it is the one it
  // belongs to, without a reload (issue #64).
  await expect(toggle(page, "Unfollow")).toHaveAttribute("aria-pressed", "true");
  await expect(followed(page)).toHaveText(/^you follow 1 of your \d+ free follows$/);
  await expect(section(page, "following").getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(section(page, "catalog").getByRole("link", { name: technology.name, exact: true })).toHaveCount(0);

  // The reload reads the database, which the press has not reached yet.
  await followWritten(toggle(page, "Unfollow"));
  await page.reload();
  await expect(followed(page)).toHaveText(/^you follow 1 of your \d+ free follows$/);
  await expect(section(page, "following").getByRole("button", { name: `Unfollow ${technology.name}` })).toBeVisible();
});

test("a Developer unfollows a Technology and it stays unfollowed after a reload", async ({ page }) => {
  await page.goto("/technologies");
  await toggle(page, "Follow").click();
  await expect(followed(page)).toHaveText(/^you follow 1 of your \d+ free follows$/);
  // The Toggle refuses a second press while the first is in flight, so the unfollow below waits for
  // the follow to be written, and the reload after it waits for the unfollow.
  await followWritten(toggle(page, "Unfollow"));

  await toggle(page, "Unfollow").click();
  await expect(toggle(page, "Follow")).toHaveAttribute("aria-pressed", "false");
  await expect(followed(page)).toHaveText(/^you follow 0 of your \d+ free follows$/);
  // The trip the other way: back in the Catalog, and out of `following`, on the same press.
  await expect(section(page, "catalog").getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(section(page, "following").getByRole("link", { name: technology.name, exact: true })).toHaveCount(0);

  await followWritten(toggle(page, "Follow"));
  await page.reload();
  await expect(followed(page)).toHaveText(/^you follow 0 of your \d+ free follows$/);
  await expect(toggle(page, "Follow")).toBeVisible();
});

// The Catalog is read by Category: ten groups instead of one long alphabetical list (issue #86).
function group(page: Page, category: string): Locator {
  return page.getByRole("region", { name: new RegExp(`^${category} \\(`) });
}

test("the press keeps its place when the row moves, in both directions", async ({ page }) => {
  await page.goto("/technologies");

  // Pressed from the keyboard, so the focus is the thing the move could take away. The toggle is
  // torn down in `catalog` and built again in `following`, and it comes back with the focus: that
  // is what pays for letting the row move at all (issue #64).
  await toggle(page, "Follow").focus();
  await page.keyboard.press("Enter");
  const unfollow = toggle(page, "Unfollow");
  await expect(section(page, "following").getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(unfollow).toBeFocused();

  // And on the way back, which is the same trip and the same hand on the keyboard.
  await followWritten(unfollow);
  await page.keyboard.press("Enter");
  const follow = toggle(page, "Follow");
  await expect(section(page, "catalog").getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(follow).toBeFocused();
  await followWritten(follow);
});

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

  // A group loses the row the moment it is followed, and its count says so on the same tick the
  // Catalog count does.
  await developer.clearFollows();
  await page.goto("/technologies");
  const before = await library.getByRole("heading").textContent();
  const total = Number(/\((\d+)\)/.exec(before ?? "")?.[1]);
  expect(total).toBeGreaterThan(0);
  await toggle(page, "Follow").click();
  await expect(library.getByRole("heading")).toHaveText(`library (${total - 1})`);
  await expect(library.getByRole("link", { name: technology.name, exact: true })).toHaveCount(0);
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
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT} of your ${FREE_LIMIT} free follows`);

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
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT} of your ${FREE_LIMIT} free follows`);

  // Room again: the note goes with the block.
  await section(page, "following").getByRole("button", { name: /^Unfollow / }).first().click();
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of your ${FREE_LIMIT} free follows`);
  await expect(note).toBeHidden();
  await expect(blocked).not.toHaveAttribute("aria-disabled", "true");
});

test("a follow the database refuses puts the row back and says what to do", async ({ page }) => {
  await addFollows(developer.id, fillers.ids.slice(0, FREE_LIMIT - 1));
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of your ${FREE_LIMIT} free follows`);

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
  await expect(followed(page)).toHaveText(`you follow ${FREE_LIMIT - 1} of your ${FREE_LIMIT} free follows`);
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
  await expect(followed(page)).toHaveText(`you follow 0 of your ${FREE_LIMIT} free follows`);

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

test("the filter answers to `/`, and leaves the key alone to whoever is typing", async ({ page }) => {
  await page.goto("/technologies");
  const field = page.getByRole("searchbox", { name: "filter" });
  // The `h1` is `sr-only`, so somewhere else on the page is the follow status: static text, nothing to press.
  const elsewhere = page.getByRole("region", { name: "Follow status" });
  await expect(field).toHaveAttribute("aria-keyshortcuts", "/");

  // From anywhere on the page, the key lands in the field and nothing is typed into it.
  await elsewhere.click();
  await page.keyboard.press("/");
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("");

  // Inside the field the key is a character again, and the filter is free to look for one.
  await field.fill("vi");
  await page.keyboard.press("/");
  await expect(field).toHaveValue("vi/");

  // A second press from outside selects what is there, so the next keystroke replaces it.
  await elsewhere.click();
  await page.keyboard.press("/");
  await page.keyboard.type("z");
  await expect(field).toHaveValue("z");
});

// DESIGN.md, Technology Mark. Both rows are real Catalog entries, because the mark is keyed by slug:
// `vite` has one, `playwright` has none (there is no Playwright icon in simple-icons).
test.describe("the Technology Mark", () => {
  function row(page: Page, name: string): Locator {
    return rows(page).filter({ has: page.getByRole("link", { name, exact: true }) });
  }

  test("is drawn in the name's own ink, and says nothing to a screen reader", async ({ page }) => {
    await page.goto("/technologies");
    const mark = row(page, "Vite").locator("svg").first();

    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(mark.locator("path")).toHaveAttribute("fill", "currentColor");
    // The name beside it is already the accessible name: the mark must not add a second one.
    await expect(row(page, "Vite")).toHaveAccessibleName("");
    const [markInk, nameInk] = await Promise.all([
      mark.evaluate((node) => getComputedStyle(node).color),
      row(page, "Vite").getByRole("link", { name: "Vite", exact: true }).evaluate((node) => getComputedStyle(node).color),
    ]);
    expect(markInk).toBe(nameInk);
    // 16px on the row, from the 24-unit grid the paths are drawn on.
    const box = await mark.boundingBox();
    expect(box?.width).toBeCloseTo(16, 0);
    expect(box?.height).toBeCloseTo(16, 0);
  });

  // The Reserved Space Rule: the box is there either way, so the list keeps one left edge.
  test("leaves its space empty for a Technology without one, and moves no row", async ({ page }) => {
    await page.goto("/technologies");
    const marked = row(page, "Vite");
    const unmarked = row(page, "Playwright");

    await expect(marked.locator("svg").first().locator("path")).toHaveCount(1);
    await expect(unmarked.locator("svg").first()).toBeAttached();
    await expect(unmarked.locator("svg").first().locator("path")).toHaveCount(0);

    const [markedBox, unmarkedBox, markedName, unmarkedName] = await Promise.all([
      marked.boundingBox(),
      unmarked.boundingBox(),
      marked.getByRole("link", { name: "Vite", exact: true }).boundingBox(),
      unmarked.getByRole("link", { name: "Playwright", exact: true }).boundingBox(),
    ]);
    expect(markedBox?.height).toBe(unmarkedBox?.height);
    expect(markedName?.x).toBe(unmarkedName?.x);
  });

  // At 390px the row is already two lines, so the mark must sit on the name's line and add none.
  // Boxes are compared by their vertical centre, never by their top edge: the mark is 16px and the
  // name's line box is taller, so their tops differ by design.
  test("sits on the name's line at 390px, and adds no line to the row", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/technologies");
    const marked = row(page, "Vite");
    const [mark, name, markedBox, unmarkedBox] = await Promise.all([
      marked.locator("svg").first().boundingBox(),
      marked.getByRole("link", { name: "Vite", exact: true }).boundingBox(),
      marked.boundingBox(),
      row(page, "Playwright").boundingBox(),
    ]);
    expect(mark?.width).toBeCloseTo(16, 0);
    const centre = (box: { y: number; height: number } | null) => (box ? box.y + box.height / 2 : null);
    expect(centre(mark)).toBeCloseTo(centre(name) ?? 0, 0);
    expect(markedBox?.height).toBe(unmarkedBox?.height);
  });
});
