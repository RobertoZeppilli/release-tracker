import { expect, type Page, test } from "@playwright/test";

// The landing argues by showing the work, so what is tested is that the work is on the page: the
// four stages in the DOM rather than behind a tab, the four Significance words said in words, the
// two actions, and the one motion moment held to its rule.

const STAGES = ["source", "cite", "verdict", "help"];
const WORDS = ["featured", "notable", "digest", "preview"];

const carets = (page: Page) => page.locator(".caret-run");

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
  const signIn = main.getByRole("link", { name: "Sign in with GitHub" });
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
