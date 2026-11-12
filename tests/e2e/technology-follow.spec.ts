import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  clearFollows,
  addFollows,
  followWritten,
  forgetRender,
  type FixtureTechnology,
  retireTechnology,
  seedTechnology,
  wired,
} from "./fixtures";

let technology: FixtureTechnology;
// One retired Technology each, because retiring one is not undone, and a follow written after the
// retirement is refused by the trigger: the order of the two cases is the opposite of each other.
let leaving: FixtureTechnology;
let gone: FixtureTechnology;

test.beforeAll(async () => {
  const release = [
    { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
  ] as const;
  [technology, leaving, gone] = await Promise.all([
    seedTechnology([...release]),
    seedTechnology([...release]),
    seedTechnology([...release], { retired: true }),
  ]);
});

test.afterAll(async () => {
  await Promise.all([
    technology.remove(),
    leaving.remove(),
    gone.remove(),
  ]);
});


function toggle(page: Page, action: "Follow" | "Unfollow", of: FixtureTechnology = technology): Locator {
  return page.getByRole("button", { name: `${action} ${of.name}`, exact: true });
}

function path(of: FixtureTechnology = technology): string {
  return `/technologies/${of.slug}`;
}

// The link that used to stand here for a Visitor is gone with the login (issue #210): whoever opens
// their own copy gets the Toggle itself, and the only Technology with no control at all is one that
// has left the Catalog.
test("a retired Technology offers no Follow at all", async ({ page }) => {
  await page.goto(path(gone));
  await expect(page.getByRole("note")).toContainText("no longer tracked");
  await expect(page.getByRole("button", { name: /^Follow / })).toHaveCount(0);
});

test.describe("the Follow of the Technology page", () => {
  test.beforeEach(async () => {
    await clearFollows();
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
    // ⚠️ Not `not.toContain("Unfollow")` any more: since ADR 0008 the page carries the dictionary of
    // its language for the browser to read, and `Unfollow {name}` is one of its entries. A word the
    // page could say is not state, so what is checked is the button as it was rendered: its label
    // with the Technology's own name in it, and the pressed state itself.
    expect(html).not.toContain(`Unfollow ${technology.name}`);
    expect(html).not.toContain('aria-pressed="true"');

    await toggle(page, "Unfollow").click();
    await expect(toggle(page, "Follow")).toHaveAttribute("aria-pressed", "false");
    await followWritten(toggle(page, "Follow"));
    await page.reload();
    await expect(toggle(page, "Follow")).toBeVisible();
  });

  // WCAG 1.4.11: the border is the only thing identifying this button, so every state has to keep one
  // that passes. `rule` measured 1.33:1 and was the one control border in the system outside the
  // rule; what drops between off and on is the text.
  test("keeps the border that identifies it in every state", async ({ page }) => {
    await page.goto(path());
    const strong = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--rule-strong").trim(),
    );
    const border = (button: Locator) => button.evaluate((node) => getComputedStyle(node).borderTopColor);
    const asColor = async (value: string) =>
      page.evaluate((raw) => {
        const probe = document.createElement("span");
        probe.style.color = raw;
        document.body.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, value);
    const expected = await asColor(strong);

    expect(await border(toggle(page, "Follow")), "the off state").toBe(expected);
    await toggle(page, "Follow").click();
    expect(await border(toggle(page, "Unfollow")), "the on state").toBe(expected);

    await followWritten(toggle(page, "Unfollow"));
    await clearFollows();
    await page.reload();
    expect(await border(toggle(page, "Follow")), "the off state after a reload").toBe(expected);
  });

  test("can only unfollow a retired Technology, and the page says so", async ({ page }) => {
    await addFollows([leaving.id]);
    await retireTechnology(leaving.id);
    // The retirement has to reach the page, which may hold a render from before it: see
    // `forgetRender()`.
    await forgetRender(page, "/[locale]/technologies/[slug]");
    await page.goto(path(leaving));

    // The press is the test, so the button has to be wired before it: see `wired()`.
    await wired(toggle(page, "Unfollow", leaving));
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
  await clearFollows();
  await addFollows([technology.id]);

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
  await expect.poll(() => asked, { message: "the follows are read over the wire" }).toBe(true);

  // The control's place is kept, with neither state claimed.
  await expect(page.getByRole("heading", { level: 1, name: technology.name })).toBeVisible();
  await expect(toggle(page, "Follow")).toHaveCount(0);
  await expect(toggle(page, "Unfollow")).toHaveCount(0);

  release();
  await expect(toggle(page, "Unfollow")).toBeVisible();
  await expect(toggle(page, "Follow")).toHaveCount(0);
});
