import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
  arrived,
  declareCurrentVersion,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureTechnology,
  seedDeveloper,
  seedTechnology,
} from "./fixtures";

// Inside the 30-day window the Dashboard looks back on, whenever the suite runs.
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

let developer: FixtureDeveloper;
let breaking: FixtureTechnology;
let safe: FixtureTechnology;
let busy: FixtureTechnology;
let ahead: FixtureTechnology;
let queued: FixtureTechnology;

test.beforeAll(async () => {
  [developer, breaking, safe, busy, ahead, queued] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      { version: "4.0.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: true, publishedAt: daysAgo(3) },
    ]),
    seedTechnology([
      { version: "2.1.0", significance: "featured", origin: "detected", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(5) },
    ]),
    // One Release of each Significance, and two digest Releases three weeks apart, so the quiet end
    // of the Stream has two weeks to fold and to open.
    seedTechnology([
      { version: "3.1.0", significance: "notable", origin: "detected", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(2) },
      { version: "3.2.0-beta.1", significance: "preview", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(4) },
      { version: "3.0.9", significance: "digest", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(1) },
      { version: "3.0.8", significance: "digest", origin: "detected", status: "skipped", notes: "Notes.", publishedAt: daysAgo(21) },
    ]),
    // Issue #94: nothing in the window, and real work ahead of the Version in use. The verdict used
    // to read `ok: nothing needs action` over a line saying the opposite.
    seedTechnology([
      { version: "1.0.0", significance: "notable", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false, publishedAt: daysAgo(90) },
      { version: "1.1.0", significance: "notable", origin: "imported", status: "ready", notes: "Notes.", actionRequired: true, publishedAt: daysAgo(80) },
    ]),
    // Followed, featured, and with no Summary to judge it by.
    seedTechnology([
      { version: "5.0.0", significance: "featured", origin: "detected", status: "pending", notes: "Notes.", publishedAt: daysAgo(6) },
    ]),
  ]);
});

test.afterAll(async () => {
  // A follow left by the last test still references the Technology, so it goes first.
  await developer.clearFollows();
  await Promise.all([
    developer.remove(),
    breaking.remove(),
    safe.remove(),
    busy.remove(),
    ahead.remove(),
    queued.remove(),
  ]);
});

test.beforeEach(async () => {
  await developer.clearFollows();
});

// One row per followed Technology, in the column that answers where the stack stands.
function standingRow(page: Page, name: string) {
  return page
    .getByRole("group", { name: "Followed technologies, by distance" })
    .getByRole("link")
    .filter({ hasText: name });
}

// One block of the Stream per Release: an article, never a link, because it is a block of text with
// links inside it.
function streamEvent(page: Page, name: string) {
  return page.locator("article").filter({ hasText: name }).first();
}

// A figure of the Standing Panel, read by its label: the value sits in the `dd` beside its `dt`
// (DESIGN.md, Standing Panel).
function total(page: Page, label: string) {
  return page.locator("dt", { hasText: label }).locator("+ dd");
}

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

test("says what needs action and shows the breaking changes", async ({ page }) => {
  await addFollows(developer.id, [breaking.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("1 needs action");
  await expect(standingRow(page, breaking.name)).toContainText("1 needs action");
  await expect(page.getByText("action required · 1 breaking change")).toBeVisible();
  await expect(page.getByText("The default export is gone")).toBeVisible();
  await expect(page.getByLabel("Followed technologies", { exact: true })).toContainText("1");
});

test("says nothing needs action when every featured Release is safe", async ({ page }) => {
  await addFollows(developer.id, [safe.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("nothing needs action");
  await expect(page.getByText("safe to upgrade")).toBeVisible();
  // DESIGN.md, The Standing Panel: nothing is declared here, so there is no total to print and the
  // panel says that instead of standing as a title over an empty box.
  await expect(page.getByText("no version declared yet.", { exact: false })).toBeVisible();
  await expect(total(page, "releases behind in all")).toHaveCount(0);
});

// CONTEXT.md, Verdetto della Dashboard: the verdict is the sum of the rows under it, by
// construction. The page used to print a number over two rows that said something else.
test("prints a verdict that is the sum of the rows under it", async ({ page }) => {
  await addFollows(developer.id, [breaking.id, ahead.id, safe.id]);
  await declareCurrentVersion(developer.id, ahead.id, "1.0.0");
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("2 need action");
  await expect(standingRow(page, breaking.name)).toContainText("1 needs action");
  await expect(standingRow(page, ahead.name)).toContainText("1 needs action");
  await expect(standingRow(page, safe.name)).toContainText("no version declared");
});

// CONTEXT.md, Verdetto della Dashboard: the verdict counts the Upgrade Path from the Version in use
// too, so nothing need have happened in the window for the page to say there is work.
test("counts the work ahead of the Version in use, with nothing in the window", async ({ page }) => {
  await addFollows(developer.id, [ahead.id]);
  await declareCurrentVersion(developer.id, ahead.id, "1.0.0");
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("1 needs action");
  await expect(standingRow(page, ahead.name)).toContainText("1 needs action");
  await expect(total(page, "releases behind in all")).toHaveText("1");
});

test("gives no verdict when nothing it accounts for can be judged", async ({ page }) => {
  await addFollows(developer.id, [queued.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.locator("#page-verdict")).toContainText("nothing judged yet");
  await expect(page.locator("#page-verdict")).not.toContainText("nothing needs action");
});

// CONTEXT.md, Distanza: without a declaration there is no Distance, so the row says so and draws no
// bar. A bar there would be the one number this product promises never to invent.
test("says a Technology with no declaration has no distance, and draws no bar for it", async ({ page }) => {
  // Two declarations, so the bar lane is drawn at all: with fewer than two Distances it goes
  // rather than lies, every bar being 100% of itself (DESIGN.md, The Distance bar).
  await addFollows(developer.id, [safe.id, busy.id, ahead.id]);
  await declareCurrentVersion(developer.id, busy.id, "3.0.8");
  await declareCurrentVersion(developer.id, safe.id, "2.1.0");
  await signIn(page);
  await page.goto("/dashboard");

  const row = standingRow(page, ahead.name);
  await expect(row).toContainText("no version declared");
  await expect(row.locator("span[aria-hidden='true']")).toHaveCount(0);
  await expect(standingRow(page, busy.name)).toContainText("2 behind 3.0.8");
  await expect(standingRow(page, busy.name).locator("span[aria-hidden='true']")).toHaveCount(1);
  await expect(standingRow(page, safe.name)).toContainText("up to date");
});

// DESIGN.md, Standing Column: the rows are links, so the keyboard reaches and scrolls the list
// without a scrollbar to drag.
test("reaches a Technology from the Standing with the keyboard", async ({ page }) => {
  await addFollows(developer.id, [breaking.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await standingRow(page, breaking.name).focus();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(`/technologies/${breaking.slug}`);
});

test("offers the Catalog when the Developer follows nothing, and follows from there", async ({ page }) => {
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByText("you follow no technologies yet")).toBeVisible();
  await expect(page.getByLabel("Followed technologies", { exact: true })).toContainText("0");
  // DESIGN.md, Empty State: the split arrives with the first follow, and the way on with it.
  await expect(page.getByRole("button", { name: "Open dashboard" })).toHaveCount(0);

  // Whichever Technology the shortlist happens to open with: the point is that following works
  // here exactly as it does on /technologies, and that the page then has a stack to show.
  await page.getByRole("button", { name: /^Follow / }).first().click();
  await expect(page.getByLabel("Followed technologies", { exact: true })).toContainText("1");

  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.getByText("you follow no technologies yet")).toBeHidden();
  // The panel is titled by the verdict now, and with a stack followed the page has one to make
  // (DESIGN.md, Standing Panel).
  await expect(page.locator("#page-verdict")).toBeVisible();
});

// CONTEXT.md, Flusso: one stream in date order with no divisions by Significance, and the Digests
// are the one thing that leaves it, folded at its quiet end.
test("puts the window in one stream in date order, with the Digests folded at the end", async ({ page }) => {
  await addFollows(developer.id, [busy.id]);
  await signIn(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: /what happened · last 30 days, 4 releases/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "3.1.0", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "3.2.0-beta.1", exact: true })).toBeVisible();
  // The Digests are not among the days: they are behind the one row that folds the quiet stretch.
  await expect(page.getByRole("link", { name: "3.0.9", exact: true })).toBeHidden();
  await expect(page.getByText("2 more releases, none asking anything")).toBeVisible();

  // The date cell of each day block, and not the dates inside the folded weeks under it.
  const dates = await page
    .locator("main section > div > p > time")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());
});

test("keeps an open week of the Digest in the URL, through a reload and in a shared link", async ({ page }) => {
  await addFollows(developer.id, [busy.id]);
  await signIn(page);
  await page.goto("/dashboard");

  const line = page.getByRole("link", { name: "3.0.9", exact: true });
  await expect(line).toBeHidden();

  // The quiet stretch is one row until it is opened, and the weeks are inside it.
  await page.locator("#digest > summary").click();
  await page.locator("#digest details").first().locator("summary").click();
  await expect(line).toBeVisible();
  await expect(page).toHaveURL(/\?week=\d{4}-W\d{2}$/);

  const shared = page.url();
  await page.reload();
  await page.locator("#digest > summary").click();
  await expect(page.getByRole("link", { name: "3.0.9", exact: true })).toBeVisible();

  await page.goto("/dashboard");
  await page.locator("#digest > summary").click();
  await expect(page.getByRole("link", { name: "3.0.9", exact: true })).toBeHidden();
  await page.goto(shared);
  await page.locator("#digest > summary").click();
  await expect(page.getByRole("link", { name: "3.0.9", exact: true })).toBeVisible();

  // Closing the last open week takes the parameter out instead of leaving it empty.
  await page.locator("#digest details").first().locator("summary").click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

// DESIGN.md: both of these are measured, never assumed. A second scrollbar 360px from the page's
// own would ask the reader which one they are in, and a verdict that ran past two lines would be a
// summary taller than the list it summarises (The One-Line Verdict Rule).
test("keeps the verdict short, the list without a scrollbar and the columns apart", async ({ page }) => {
  await addFollows(developer.id, [breaking.id, safe.id, busy.id, queued.id]);
  await signIn(page);
  await page.goto("/dashboard");
  // ⚠️ Before the first measurement, never after it: the wait and the page share the document for a
  // moment, so `main aside` and `main > p` can come from two different `main` elements
  // (`arrived()` in `fixtures.ts`, and issue #178).
  await arrived(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const measured = await page.evaluate(() => {
    const need = (selector: string) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) throw new Error(`no ${selector} on the page`);
      return node;
    };
    const list = need('[aria-label="Followed technologies, by distance"]');
    const verdict = need("#page-verdict");
    const aside = need("main aside");
    // The window line, the one paragraph the split carries under both its columns.
    const foot = need("main > p");
    return {
      hiddenBar: list.offsetWidth - list.clientWidth,
      lines: verdict.getBoundingClientRect().height / parseFloat(getComputedStyle(verdict).lineHeight),
      insideColumn: aside.getBoundingClientRect().right - verdict.getBoundingClientRect().right,
      // The sticky column stops at the end of the split instead of sliding over what is under it.
      overlap: aside.getBoundingClientRect().bottom - foot.getBoundingClientRect().top,
      sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(measured.hiddenBar, "the width the Standing loses to a scrollbar").toBe(0);
  // One line, inside the panel it titles (DESIGN.md, The One-Line Verdict Rule).
  expect(measured.lines, "the lines the verdict takes").toBeLessThan(1.5);
  expect(measured.insideColumn, "the room left between the verdict and the Stream").toBeGreaterThanOrEqual(0);
  expect(measured.overlap, "how far the Standing runs into the line under it").toBeLessThanOrEqual(0);
  expect(measured.sideways, "how far the page scrolls sideways").toBe(0);

  // ⚠️ Measured where the clamp reaches its cap, which 1280px never does: the column stays 360px
  // while the scale used to keep growing with the viewport, so the wrap only ever showed up on a
  // wide screen. The longest claim the two panels can say stands in for the one this fixture
  // happens to show, because what is being measured is the font against 326px of panel, not this
  // page's counts.
  await page.setViewportSize({ width: 1600, height: 900 });
  const widest = await page.evaluate(() => {
    const verdict = document.querySelector("#page-verdict");
    if (!(verdict instanceof HTMLElement)) throw new Error("no verdict on the page");
    const lines = () =>
      verdict.getBoundingClientRect().height / parseFloat(getComputedStyle(verdict).lineHeight);
    const asIs = lines();
    // The longest pair either panel can say, label included: `note:` is five characters where this
    // fixture shows `warning:`, so the claim cannot be swapped without the label it comes with.
    const label = verdict.firstElementChild?.lastChild;
    const claim = verdict.lastChild;
    if (!label || !claim) throw new Error("the verdict has no label and claim");
    label.textContent = "note:";
    claim.textContent = " 12 without a verdict";
    return { asIs, longest: lines() };
  });

  expect(widest.asIs, "the lines the verdict takes at 1600px").toBeLessThan(1.5);
  expect(widest.longest, "the lines the longest claim takes at 1600px").toBeLessThan(1.5);
});

// DESIGN.md, In Use Line: the declaration shows up in one place, the row's own words, and the day
// it was made is said once for the whole page, in the totals.
test("names the declared Version in use on the row, and the oldest declaration once", async ({ page }) => {
  await addFollows(developer.id, [busy.id]);
  await declareCurrentVersion(developer.id, busy.id, "3.0.8");
  await signIn(page);
  await page.goto("/dashboard");

  await expect(standingRow(page, busy.name)).toContainText("2 behind 3.0.8");
  await expect(total(page, "releases behind in all")).toHaveText(/^\d+$/);
  await expect(total(page, "oldest version declared")).toHaveText(/\d{4}-\d{2}-\d{2}/);
  // The Stream cites the declaration and never counts from it: the count belongs to the Standing.
  await expect(streamEvent(page, "3.1.0")).toContainText("you are on 3.0.8");
  await expect(streamEvent(page, "3.1.0")).not.toContainText("behind");
});

// DESIGN.md, Neutral row verdicts. The Dashboard and the Technology page used to answer this in two
// vocabularies: the Dashboard collapsed `skipped`, `unavailable` and `failed` into one line reading
// `no summary · read the release notes`, so a Release with no notes at all was told to read them.
// `unavailable` is exactly "no notes" (`initialSummaryStatus`), and one function now answers both.
test.describe("a Release with no notes reads the same on both surfaces", () => {
  let noteless: FixtureTechnology;

  test.beforeAll(async () => {
    noteless = await seedTechnology([
      { version: "7.0.0", significance: "featured", origin: "detected", status: "unavailable", notes: null, publishedAt: daysAgo(2) },
    ]);
  });

  test.afterAll(async () => {
    await developer.clearFollows();
    await noteless.remove();
  });

  test("the Dashboard names what is missing and offers nothing to read", async ({ page }) => {
    await addFollows(developer.id, [noteless.id]);
    await signIn(page);
    await page.goto("/dashboard");

    const event = streamEvent(page, noteless.name);
    await expect(event).toContainText("note: no release notes to summarize");
    await expect(event).not.toContainText("read the release notes");
    await expect(event.getByRole("link", { name: "read the release notes" })).toHaveCount(0);
  });

  test("the Technology page says the same words", async ({ page }) => {
    await page.goto(`/technologies/${noteless.slug}`);
    await expect(page.getByText("note: no release notes to summarize")).toBeVisible();
  });

  // The other half of the rule: where notes do exist, the row offers them as a link rather than as
  // a sentence naming an action it does not give.
  test("a queued Summary offers the notes as a link", async ({ page }) => {
    await developer.clearFollows();
    await addFollows(developer.id, [queued.id]);
    await signIn(page);
    await page.goto("/dashboard");

    const event = streamEvent(page, queued.name);
    await expect(event).toContainText("pending: summary queued");
    await expect(event.getByRole("link", { name: "read the release notes" })).toHaveAttribute(
      "href",
      `/technologies/${queued.slug}/5.0.0`,
    );
  });
});
