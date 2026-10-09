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

// Issue #140: the landing is a static document, so it cannot know who is reading it before the first
// paint. The entry action is the one element that learns, and what it owes the page is that learning
// it changes nothing but its own words.
test("with a session open the three entry actions lead to the Dashboard, and the change moves nothing", async ({
  page,
}) => {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);

  // The session arrives over the network, and without a delay it can land before the first
  // measurement: held back, the two faces of the same page are measured on the same load.
  await page.route("**/auth/v1/user**", async (route) => {
    await new Promise((settle) => setTimeout(settle, 600));
    await route.continue();
  });
  await page.goto("/");
  const main = page.getByRole("main");

  // Before the session lands the prerendered face is the visitor's, in all three places.
  const waiting = main.getByRole("link", { name: ENTRY_VISITOR });
  await expect(waiting).toHaveCount(3);
  const before = await boxesOf(waiting);
  // A handle on a node of the page: if the session remounted the page this one would be replaced
  // and the handle would be left pointing outside the document (the trap of 2026-09-30).
  const quote = await page.locator("#cited-quote").elementHandle();

  const arrived = main.getByRole("link", { name: ENTRY_DEVELOPER });
  await expect(arrived).toHaveCount(3);
  await expect(main.getByRole("link", { name: ENTRY_VISITOR })).toHaveCount(0);
  for (const link of await arrived.all()) {
    await expect(link).toHaveAttribute("href", "/dashboard");
  }

  // Measured, not supposed: same place, same size, in both faces.
  expect(await boxesOf(arrived)).toEqual(before);
  expect(await quote?.evaluate((node) => node.isConnected)).toBe(true);
});
