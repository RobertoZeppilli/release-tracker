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

// The two questions, a column each (DESIGN.md, The Two Questions Rule): what is in the stack, and
// what could go in it. The Catalog's own title names the ordering in force, so it is matched by its
// opening words.
function stack(page: Page): Locator {
  return page.getByRole("region", { name: "what you follow, by name" });
}

function catalog(page: Page): Locator {
  return page.getByRole("region", { name: /^what you could add/ });
}

function retired(page: Page): Locator {
  return page.getByRole("region", { name: "retired, still yours" });
}

// The quota is counted once on this page, in the panel at the head of the left column.
function followed(page: Page): Locator {
  return page.getByTestId("follow-status");
}

function rows(page: Page): Locator {
  return catalog(page).getByRole("listitem");
}

function filter(page: Page): Locator {
  return page.getByRole("searchbox", { name: "find a technology" });
}

function matches(page: Page): Locator {
  return page.locator("#matches");
}

test.beforeEach(async ({ page }) => {
  await developer.clearFollows();
  await signIn(page);
});

test("a Developer follows a Technology, and the follow is still there after a reload", async ({ page }) => {
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText("0");
  await expect(
    catalog(page).getByRole("link", { name: technology.name, exact: true }),
  ).toHaveAttribute("href", `/technologies/${technology.slug}`);

  await toggle(page, "Follow").click();
  // The row answers at once, and it has already crossed the split: the column that holds it is the
  // one it belongs to, without a reload (issue #64).
  await expect(toggle(page, "Unfollow")).toHaveAttribute("aria-pressed", "true");
  await expect(followed(page)).toHaveText("1");
  await expect(stack(page).getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(catalog(page).getByRole("link", { name: technology.name, exact: true })).toHaveCount(0);

  // The reload reads the database, which the press has not reached yet.
  await followWritten(toggle(page, "Unfollow"));
  await page.reload();
  await expect(followed(page)).toHaveText("1");
  await expect(stack(page).getByRole("button", { name: `Unfollow ${technology.name}` })).toBeVisible();
});

test("a Developer unfollows a Technology and it stays unfollowed after a reload", async ({ page }) => {
  await page.goto("/technologies");
  await toggle(page, "Follow").click();
  await expect(followed(page)).toHaveText("1");
  // The Toggle refuses a second press while the first is in flight, so the unfollow below waits for
  // the follow to be written, and the reload after it waits for the unfollow.
  await followWritten(toggle(page, "Unfollow"));

  await toggle(page, "Unfollow").click();
  await expect(toggle(page, "Follow")).toHaveAttribute("aria-pressed", "false");
  await expect(followed(page)).toHaveText("0");
  // The trip the other way: back in the Catalog, and out of the stack, on the same press.
  await expect(catalog(page).getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(stack(page).getByRole("link", { name: technology.name, exact: true })).toHaveCount(0);

  await followWritten(toggle(page, "Follow"));
  await page.reload();
  await expect(followed(page)).toHaveText("0");
  await expect(toggle(page, "Follow")).toBeVisible();
});

// The Catalog is read by Category: ten groups instead of one long alphabetical list (issue #86).
function group(page: Page, category: string): Locator {
  return page.getByRole("region", { name: new RegExp(`^${category} \\(`) });
}

test("the press keeps its place when the row crosses the split, in both directions", async ({ page }) => {
  await page.goto("/technologies");

  // Pressed from the keyboard, so the focus is the thing the move could take away. The control is
  // torn down in the Catalog and built again in the stack, and the focus follows it: that is what
  // pays for letting the row move at all (issue #64).
  await toggle(page, "Follow").focus();
  await page.keyboard.press("Enter");
  const unfollow = toggle(page, "Unfollow");
  await expect(stack(page).getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(unfollow).toBeFocused();

  // And on the way back, which is the same trip and the same hand on the keyboard.
  await followWritten(unfollow);
  await page.keyboard.press("Enter");
  const follow = toggle(page, "Follow");
  await expect(catalog(page).getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(follow).toBeFocused();
  await followWritten(follow);
});

test("the Catalog is grouped by Category, and a followed row leaves its group", async ({ page }) => {
  await page.goto("/technologies");

  // The fixture is a `library` and the fillers are a `platform`, so both groups are on the page and
  // the row sits in its own one.
  const library = group(page, "library");
  await expect(library.getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(group(page, "platform").getByRole("link", { name: technology.name })).toHaveCount(0);

  // The stack is never grouped: the Category answers "what could go in my stack", which is a
  // question only the Catalog is asked.
  await toggle(page, "Follow").click();
  await page.reload();
  await expect(stack(page).getByRole("link", { name: technology.name, exact: true })).toBeVisible();
  await expect(stack(page).getByRole("region", { name: /\(/ })).toHaveCount(0);

  // A group loses the row the moment it is followed, and its count says so on the same tick the
  // panel's figure does.
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
  const total = Number(/^(\d+) technologies$/.exec((await matches(page).textContent()) ?? "")?.[1]);

  await filter(page).fill(technology.name);
  // The only group left is the one holding the match; the count is over the whole Catalog.
  await expect(group(page, "library")).toBeVisible();
  await expect(group(page, "platform")).toBeHidden();
  await expect(matches(page)).toHaveText(`1 of ${total} match`);
  await expect(rows(page)).toHaveCount(1);

  await filter(page).fill("");
  await expect(group(page, "platform")).toBeVisible();
});

test("the filter narrows the rows, counts the matches and says when nothing matches", async ({ page }) => {
  await page.goto("/technologies");
  const total = Number(/^(\d+) technologies$/.exec((await matches(page).textContent()) ?? "")?.[1]);
  expect(total).toBeGreaterThan(1);

  await filter(page).fill(technology.name);
  await expect(matches(page)).toHaveText(`1 of ${total} match`);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);

  await filter(page).fill("not-a-technology");
  await expect(matches(page)).toHaveText(`0 of ${total} match`);
  await expect(rows(page)).toHaveCount(0);
  // The Catalog is curated: the note names the query and offers no form and no link.
  const noMatch = page.locator("#no-match");
  await expect(noMatch).toBeVisible();
  await expect(noMatch).toContainText("no technology matches");
  await expect(noMatch).toContainText("not-a-technology");
  await expect(noMatch.getByRole("link")).toHaveCount(0);
  await expect(noMatch.locator("form")).toHaveCount(0);
  // The filter belongs to the Catalog and empties the Catalog alone: the stack stays where it is.
  await expect(stack(page).getByRole("listitem")).toHaveCount(0);
  await expect(followed(page)).toHaveText("0");
});

test("Esc empties the filter and leaves the focus in it", async ({ page }) => {
  await page.goto("/technologies");
  await filter(page).fill(technology.name);
  await expect(rows(page)).toHaveCount(1);

  await filter(page).press("Escape");
  await expect(filter(page)).toHaveValue("");
  await expect(filter(page)).toBeFocused();
  await expect(page).toHaveURL("/technologies");
});

// DESIGN.md, Category Chips and The Address Rule: the chosen Category is what the page is showing,
// so it is in the address; the count says where it is counting.
test("a Category chip narrows the Catalog, says where it counts and lands in the URL", async ({ page }) => {
  await page.goto("/technologies");
  await page.getByRole("button", { name: "library", exact: true }).click();

  await expect(page).toHaveURL("/technologies?category=library");
  await expect(group(page, "library")).toBeVisible();
  await expect(group(page, "platform")).toHaveCount(0);
  await expect(matches(page)).toHaveText(/^\d+ technologies in library$/);

  // `all` is the way back, and it takes the parameter out instead of writing it empty.
  await page.getByRole("button", { name: "all", exact: true }).click();
  await expect(page).toHaveURL("/technologies");
  await expect(group(page, "platform")).toBeVisible();
});

// DESIGN.md, Catalog Ordering and Catalog Layout: how one reader reads is remembered in this
// browser and never written to the address.
test("the ordering and the layout are remembered, and stay out of the address", async ({ page }) => {
  await page.goto("/technologies");
  await page.getByRole("button", { name: "latest release" }).click();

  // By latest release the Categories go: one group, named by the one ordering there is.
  await expect(group(page, "latest release first")).toBeVisible();
  await expect(group(page, "library")).toHaveCount(0);
  await expect(catalog(page)).toContainText("what you could add, by latest release");

  await page.getByRole("button", { name: "grid" }).click();
  await expect(page).toHaveURL("/technologies");

  await page.reload();
  await expect(page.getByRole("button", { name: "latest release" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "grid" })).toHaveAttribute("aria-pressed", "true");
  await expect(group(page, "latest release first")).toBeVisible();
});

test("at ten of ten the other toggles are blocked, still reachable, and say why", async ({ page }) => {
  await addFollows(developer.id, fillers.ids);
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(String(FREE_LIMIT));

  const note = page.locator("#limit-note");
  await expect(note).toBeVisible();
  await expect(note).toContainText("let one go in what you follow to follow another");
  // It names the wall and does not recount it: the figure is in the panel across the split.
  await expect(note).not.toContainText(/\d/);
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
  await expect(followed(page)).toHaveText(String(FREE_LIMIT));

  // Room again: the note goes with the block, and the way out of a follow is in the stack.
  await stack(page).getByRole("button", { name: /^Unfollow / }).first().click();
  await expect(followed(page)).toHaveText(String(FREE_LIMIT - 1));
  await expect(note).toBeHidden();
  await expect(blocked).not.toHaveAttribute("aria-disabled", "true");
});

test("a follow the database refuses puts the row back and says what to do", async ({ page }) => {
  await addFollows(developer.id, fillers.ids.slice(0, FREE_LIMIT - 1));
  await page.goto("/technologies");
  await expect(followed(page)).toHaveText(String(FREE_LIMIT - 1));

  // The tenth arrives from another session, so this page still believes there is room.
  await addFollows(developer.id, fillers.ids.slice(FREE_LIMIT - 1));
  await toggle(page, "Follow").click();

  const error = page.locator(`#err-${technology.slug}`);
  await expect(error).toBeVisible();
  await expect(error).toContainText("not followed");
  await expect(error).toContainText("let one go to follow another");
  await expect(error).not.toContainText(/pro/i);

  const back = toggle(page, "Follow");
  await expect(back).toHaveAttribute("aria-pressed", "false");
  await expect(back).toHaveAttribute("aria-describedby", new RegExp(`err-${technology.slug}`));
  await expect(followed(page)).toHaveText(String(FREE_LIMIT - 1));
});

test("a retired Technology closes the stack, can only be let go, and the row says so", async ({ page }) => {
  await addFollows(developer.id, [leaving.id]);
  await retireTechnology(leaving.id);
  await page.goto("/technologies");

  // It is in the left column, because being followed is the only reason it is shown at all.
  await expect(retired(page)).toContainText(`they still count toward your ${FREE_LIMIT}`);
  const row = retired(page).getByRole("listitem").filter({ hasText: leaving.name });
  await expect(row).toContainText("last");

  await row.getByRole("button", { name: `Unfollow ${leaving.name}` }).click();
  await expect(row).toContainText("let go, for good");
  await expect(row.getByRole("button")).toHaveCount(0);
  await expect(followed(page)).toHaveText("0");

  // And it is gone on the next visit, because nobody follows it any more.
  await page.reload();
  await expect(page.getByRole("link", { name: leaving.name, exact: true })).toHaveCount(0);
});

test("the filter lands in the URL, survives a reload and leaves the history alone", async ({ page }) => {
  await page.goto("/technologies");
  await filter(page).fill(technology.name);
  await expect(rows(page)).toHaveCount(1);
  await expect(page).toHaveURL(`/technologies?${new URLSearchParams({ filter: technology.name })}`);

  await page.reload();
  await expect(filter(page)).toHaveValue(technology.name);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);

  // Typing replaces the entry instead of adding one, so back leaves the page.
  await filter(page).fill("");
  await expect(page).toHaveURL("/technologies");
  await expect(rows(page).first()).toBeVisible();
  await page.goBack();
  await expect(page).not.toHaveURL(/\/technologies/);
});

test("a filtered address opened from scratch shows the same view as typing", async ({ page }) => {
  await page.goto(`/technologies?${new URLSearchParams({ filter: technology.name })}`);
  await expect(matches(page)).toHaveText(/^1 of \d+ match$/);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(technology.name);
  await expect(filter(page)).toHaveValue(technology.name);

  // An empty parameter is the unfiltered page.
  await page.goto("/technologies?filter=");
  await expect(matches(page)).toHaveText(/^\d+ technologies$/);
  await expect(rows(page).first()).toBeVisible();
});

test("a filtered address that matches nothing says so, like typing it does", async ({ page }) => {
  await page.goto("/technologies?filter=not-a-technology&stray=1");
  await expect(matches(page)).toHaveText(/^0 of \d+ match$/);
  await expect(rows(page)).toHaveCount(0);
  const noMatch = page.locator("#no-match");
  await expect(noMatch).toContainText("not-a-technology");

  // An unrelated parameter is left where it was.
  await filter(page).fill("");
  await expect(page).toHaveURL("/technologies?stray=1");
});

test("the filter answers to `/`, and leaves the key alone to whoever is typing", async ({ page }) => {
  await page.goto("/technologies");
  const field = filter(page);
  // The `h1` is `sr-only`, so somewhere else on the page is the panel: static text, nothing to press.
  const elsewhere = page.getByText("left on your free plan");
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
