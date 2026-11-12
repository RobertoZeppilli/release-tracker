import { expect, type Locator, type Page, test } from "@playwright/test";

// The landing argues by showing the work, so what is tested is that the work is on the page: the
// proof over the fold, the four stages in the DOM rather than behind a tab, the four Significance
// words said in words, the two actions, and the two motion moments held to their rules.

const STAGES = ["source", "cite", "verdict", "help"];
const WORDS = ["featured", "notable", "digest", "preview"];

const ENTRY = "Go to your dashboard";

const carets = (page: Page) => page.locator(".caret-run");

declare global {
  interface Window {
    quoteSwaps: number;
  }
}


// Every band arrived and every transition finished. An arrival moves an element 10px while it runs,
// so a box read mid-arrival differs from the same box afterwards for a reason that has nothing to do
// with the session (DESIGN.md, The Arrival Rule).
async function settled(page: Page): Promise<void> {
  await page.keyboard.press("End");
  await expect(page.locator('[data-arrival="armed"]')).toHaveCount(0);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
}

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

// The half a parity test cannot see: the landing is prose, so a key present in Italian and a page
// rendered in Italian are two different claims. The notes inside the panel are checked to be still
// English on the same page, because that is the product's whole argument (ADR 0008): the interface
// is translated and the release notes are not.
test("the Italian landing is read in Italian, and the notes inside it are not", async ({ page }) => {
  await page.goto("/it");

  await expect(page).toHaveTitle("Verdict, capire prima di aggiornare");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Capire prima di aggiornare.");
  await expect(page.getByText("righe lette")).toBeVisible();
  // The four stage names stay English in every language: each one is also the anchor of its stage.
  for (const stage of STAGES) await expect(page.locator(`#stage-${stage}`)).toBeVisible();
  // The cited line is the text the project published, kept word for word.
  await expect(page.getByRole("main").locator("ol").first()).toContainText(
    "Using `propTypes` will now be silently ignored",
  );
});

// The other three, checked the way the Italian one is: the title and the claim together, because
// the claim alone is a `h1` any language fills and the title is what a parity test cannot see.
// The display claim carries its full stop and the band titles under it do not, so the assertion is
// on the whole text and not on a substring of it.
test("the landing is read in French, Spanish and German", async ({ page }) => {
  const landings = [
    { locale: "fr", title: "Verdict, comprendre avant de mettre à jour", claim: "Comprendre avant de mettre à jour." },
    { locale: "es", title: "Verdict, entender antes de actualizar", claim: "Entender antes de actualizar." },
    { locale: "de", title: "Verdict, verstehen vor dem Upgrade", claim: "Verstehen vor dem Upgrade." },
  ] as const;

  for (const { locale, title, claim } of landings) {
    await page.goto(`/${locale}`);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(claim);
    // The release notes inside the page stay the text the project published, in every language:
    // that is the product's argument and not a property of Italian (ADR 0008).
    await expect(page.getByRole("main").locator("ol").first()).toContainText(
      "Using `propTypes` will now be silently ignored",
    );
  }
});

test("the proof stands beside the claim, with the real line and the verdict it produced", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByRole("main").locator("ol").first();

  // The cited line, word for word out of the notes, and three real lines around it.
  await expect(panel.getByRole("listitem")).toHaveCount(4);
  await expect(panel).toContainText("Using `propTypes` will now be silently ignored");
  await expect(page.getByText("warning:").first()).toBeVisible();
});

test("the four stages are on the page, in reading order, each saying its name", async ({ page }) => {
  await page.goto("/");

  for (const stage of STAGES) {
    const node = page.locator(`#stage-${stage}`);
    await expect(node).toBeVisible();
    await expect(node.getByRole("heading", { level: 3 })).toHaveText(stage);
  }
  // The rail is gone with the long bench: nothing points at a stage the reader can already see.
  for (const stage of STAGES) {
    await expect(page.getByRole("link", { name: stage, exact: true })).toHaveCount(0);
  }
});

// DESIGN.md, The Arrival Rule: a band arrives once, and only a band that is still below the fold is
// ever armed. Hiding something the reader can already see and fading it back in is the one thing an
// arrival may not do, and hydration is exactly when that would happen.
test("the bands arrive once, and never the ones already on the screen", async ({ page }) => {
  await page.goto("/");
  const bands = page.locator("[data-arrival]");

  await expect(bands.first()).toHaveAttribute("data-arrival", "");
  const armed = page.locator('[data-arrival="armed"]');
  await expect(armed.first()).toBeAttached();

  const last = bands.last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveAttribute("data-arrival", "in");
});

test("nothing is armed under reduced motion, or with JavaScript off", async ({ browser, page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('[data-arrival="armed"]')).toHaveCount(0);
  await expect(page.locator("#stage-help")).toBeVisible();

  const context = await browser.newContext({ javaScriptEnabled: false });
  const still = await context.newPage();
  await still.goto("/");
  await expect(still.locator('[data-arrival="armed"]')).toHaveCount(0);
  await expect(still.locator("#significance")).toBeVisible();
  await context.close();
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

test("the two actions lead to a public release page and to the Dashboard, and nowhere else", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: /the verdict for react 19\.0\.0$/ })).toHaveAttribute(
    "href",
    "/technologies/react/19.0.0",
  );
  const entry = main.getByRole("link", { name: ENTRY });
  // Twice and no more: the first screen and the closing band (DESIGN.md, The Bench).
  await expect(entry).toHaveCount(2);
  for (const link of await entry.all()) {
    await expect(link).toHaveAttribute("href", "/dashboard");
  }
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

// Issue #140: the landing is a static document, and its entry action used to be the one element
// that learned who was reading, with two faces measured against each other so that the change moved
// nothing. The login left in issue #210 and took the second face with it, so what is left to prove
// is the half that was never about the session: the page is built once, and the quoted line over
// the fold is the same node from the first paint to the last.
test("the landing is built once: nothing over the fold is swapped after it arrives", async ({ page }) => {
  // Watches the quoted line from before the document exists: a page rebuilt after the first paint
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

  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await settled(page);

  const entry = page.getByRole("main").getByRole("link", { name: ENTRY });
  await expect(entry).toHaveCount(2);
  // Measured once the fonts have settled: a box read mid-swap differs from the same box afterwards
  // for a reason that has nothing to do with the page.
  expect((await boxesOf(entry)).length).toBe(2);
  expect(await page.evaluate(() => window.quoteSwaps)).toBe(0);
});
