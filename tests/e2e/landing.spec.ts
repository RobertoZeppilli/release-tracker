import { expect, type Locator, type Page, test } from "@playwright/test";
import { e2eAuthSecret, type FixtureDeveloper, seedDeveloper } from "./fixtures";

// The landing argues by showing the work, so what is tested is that the work is on the page: the
// four stages in the DOM rather than behind a tab, the four Significance words said in words, the
// two actions, and the one motion moment held to its rule.

const STAGES = ["source", "cite", "verdict", "help"];
const WORDS = ["featured", "notable", "digest", "preview"];

const ENTRY_VISITOR = "Sign in with GitHub";
const ENTRY_DEVELOPER = "Go to your dashboard";

const carets = (page: Page) => page.locator(".caret-run");

declare global {
  interface Window {
    quoteSwaps: number;
  }
}

let developer: FixtureDeveloper;

test.beforeAll(async () => {
  developer = await seedDeveloper();
});

test.afterAll(async () => {
  await developer.remove();
});

async function boxesOf(links: Locator): Promise<(readonly number[])[]> {
  const all = await links.all();
  return Promise.all(
    all.map(async (link) => {
      const box = await link.boundingBox();
      if (!box) throw new Error("the entry action has no box");
      return [box.x, box.y, box.width, box.height] as const;
    }),
  );
}

test("the claim and the specimen open the page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Verdict, understand before you upgrade");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Understand before you upgrade.");
  await expect(page.getByText("React 19.0.0", { exact: false }).first()).toBeVisible();
});

test("the four stages are on the page, in reading order, and the rail only moves the reader", async ({ page }) => {
  await page.goto("/");

  for (const stage of STAGES) {
    await expect(page.locator(`#stage-${stage}`)).toBeVisible();
  }
  // Anchors, not tabs: each rail link points at a stage that is already in the document.
  for (const stage of STAGES) {
    await expect(page.getByRole("link", { name: stage, exact: true })).toHaveAttribute("href", `#stage-${stage}`);
  }
});

test("every stage is there with JavaScript off, the quoted line included", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  for (const stage of STAGES) {
    await expect(page.locator(`#stage-${stage}`)).toBeVisible();
  }
  await expect(page.locator("#cited-quote")).toContainText("will now be silently ignored");
  // The caret row is the page's one motion moment, and without JavaScript there is nobody to draw
  // it: it has to arrive already drawn rather than clipped to nothing.
  await expect(carets(page)).toBeVisible();
  await expect(page.locator("#cited-quote")).not.toHaveAttribute("data-draw", /.*/);

  await context.close();
});

test("the caret row draws once the cited line is reached, and is simply there under reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const well = page.locator("#cited-quote");

  // Above the fold the run is armed and waiting; nothing has drawn yet.
  await expect(well).toHaveAttribute("data-draw", "armed");
  await well.scrollIntoViewIfNeeded();
  await expect(well).toHaveAttribute("data-draw", "drawn");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#cited-quote")).not.toHaveAttribute("data-draw", /.*/);
  await expect(carets(page)).toBeVisible();
});

test("the four words of the Rilevanza are defined in words, under the id the app can point at", async ({ page }) => {
  await page.goto("/");
  const legend = page.locator("#significance");

  await expect(legend.locator("dt")).toHaveText(WORDS);
  for (const word of WORDS) {
    const definition = legend.locator("dt", { hasText: new RegExp(`^${word}$`) }).locator("xpath=following-sibling::dd[1]");
    await expect(definition).not.toBeEmpty();
  }
});

test("the two actions lead to a public release page and to the login, and nowhere else", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: /the verdict for react 19\.0\.0$/ })).toHaveAttribute(
    "href",
    "/technologies/react/19.0.0",
  );
  const signIn = main.getByRole("link", { name: ENTRY_VISITOR });
  await expect(signIn).toHaveCount(3);
  await expect(signIn.first()).toHaveAttribute("href", "/login?next=%2Fdashboard");
  await expect(main.getByRole("link", { name: /^browse all \d+ technologies$/ })).toHaveAttribute(
    "href",
    "/technologies",
  );
});

test("the landing is in the index and in the sitemap, and the brand mark is the way home", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator("head link[rel=canonical]")).toHaveAttribute("href", "http://localhost:3000");
  await expect(page.getByRole("banner").getByRole("link", { name: "verdict:" })).toHaveAttribute("href", "/");

  const body = await (await request.get("/sitemap.xml")).text();
  // The same address the page declares as canonical, and not a second spelling of it.
  expect(body).toContain("<loc>http://localhost:3000</loc>");
});

// Issue #140: the landing is a static document, so it cannot know who is reading it. The entry
// action is the one element that learns, and what it owes the page is that learning it changes
// nothing but its own words.
//
// The two faces are measured on two pages rather than across one load, because there is no moment
// in between to measure: `onAuthStateChange` hands `useSession` the session out of the cookie, with
// no request to wait for, so the face changes as hydration runs. Holding back `/auth/v1/user` was
// tried and proves nothing, since nobody waits for it.
test("with a session open the three entry actions lead to the Dashboard, and the change moves nothing", async ({
  browser,
  page,
}) => {
  const visitor = await browser.newContext();
  const visitorPage = await visitor.newPage();
  await visitorPage.goto("/");
  // Measured once the fonts have settled: a box read mid-swap differs from the same box afterwards
  // for a reason that has nothing to do with the session.
  await visitorPage.evaluate(() => document.fonts.ready);
  const offered = visitorPage.getByRole("main").getByRole("link", { name: ENTRY_VISITOR });
  await expect(offered).toHaveCount(3);
  const asVisitor = await boxesOf(offered);
  await visitor.close();

  // Watches the quoted line from before the document exists: a page rebuilt when the session lands
  // would put a different node in its place, and that is the trap of 2026-09-30.
  await page.addInitScript(() => {
    window.quoteSwaps = 0;
    let seen: Element | null = null;
    const tick = () => {
      const node = document.getElementById("cited-quote");
      if (node && node !== seen) {
        if (seen !== null) window.quoteSwaps++;
        seen = node;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const main = page.getByRole("main");

  const arrived = main.getByRole("link", { name: ENTRY_DEVELOPER });
  await expect(arrived).toHaveCount(3);
  await expect(main.getByRole("link", { name: ENTRY_VISITOR })).toHaveCount(0);
  for (const link of await arrived.all()) {
    await expect(link).toHaveAttribute("href", "/dashboard");
  }

  // Measured, not supposed: the same three boxes, in the same places, whoever is reading.
  expect(await boxesOf(arrived)).toEqual(asVisitor);
  expect(await page.evaluate(() => window.quoteSwaps)).toBe(0);
});
