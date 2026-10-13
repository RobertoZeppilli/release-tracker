import { expect, type Page, test } from "@playwright/test";
import { CARET_WIDTHS, fits } from "@/modules/summaries";
import { addFollows, e2eAuthSecret, type FixtureDeveloper, type FixtureTechnology, seedDeveloper, seedTechnology } from "./fixtures";

// The guard of issue #62: no page may be wider than the window. The overflow there came from the
// release notes themselves, so it never showed up on hand-written fixtures and will come back on its
// own as new notes arrive. The fixture below is deliberately hostile: a cited line too long for any
// caret row, an identifier wider than a phone, and a bare URL with nowhere to break.

const WIDTHS = [1440, 1280, 768, 390];

const LONG_QUOTE =
  "The legacy `unstable_renderSubtreeIntoContainer` entry point is gone, and every call to it has to move to createRoot before the upgrade.";
const LONG_URL = "https://example.com/a-very-long-path/that-keeps-going/and-going/and-going/and-going/for-a-while#and-a-fragment-too";
const SHORT_QUOTE = "The default export is gone.";

// One cited line of exactly the length each width is said to hold. This is what the first fix got
// wrong: the budget was computed from a nominal character width instead of the measured one, and
// three production pages cited a line of exactly the length the 768px step claimed to hold.
const boundary = (length: number) => "The boundary line ".padEnd(length, "x").slice(0, length);
const BOUNDARY_QUOTES = CARET_WIDTHS.map((width) => boundary(fits(width)));

let developer: FixtureDeveloper;
let technology: FixtureTechnology;

test.beforeAll(async () => {
  [developer, technology] = await Promise.all([
    seedDeveloper(),
    seedTechnology([
      {
        version: "3.0.0",
        significance: "featured",
        origin: "detected",
        status: "ready",
        notes: `# 3.0.0\n\n${LONG_QUOTE}\n\nSee ${LONG_URL} for the whole story.`,
        actionRequired: true,
        summary: {
          title: "`unstable_renderSubtreeIntoContainer` is gone in 3.0.0 and calls move to `createRoot`.",
          keyPoints: [
            { text: "`unstable_renderSubtreeIntoContainer` is gone.", quote: LONG_QUOTE },
            { text: `The whole story is at ${LONG_URL}.` },
            { text: "Nothing else changed." },
          ],
          breakingChanges: [
            {
              change: "`unstable_renderSubtreeIntoContainer` is gone",
              migration: "Move the call to `createRoot`.",
              quote: LONG_QUOTE,
            },
          ],
          actionRequired: true,
        },
      },
      {
        version: "4.0.0",
        significance: "notable",
        origin: "detected",
        status: "ready",
        notes: `# 4.0.0\n\n${BOUNDARY_QUOTES.join("\n\n")}`,
        actionRequired: true,
        summary: {
          title: "Every cited line is exactly as long as its width is said to hold.",
          keyPoints: [{ text: "One." }, { text: "Two." }, { text: "Three." }],
          breakingChanges: BOUNDARY_QUOTES.map((quote, index) => ({
            change: `The boundary of ${CARET_WIDTHS[index]}px`,
            migration: "Nothing to do.",
            quote,
          })),
          actionRequired: true,
        },
      },
      {
        version: "2.0.0",
        significance: "notable",
        origin: "detected",
        status: "ready",
        notes: `# 2.0.0\n\n${SHORT_QUOTE}`,
        actionRequired: true,
        summary: {
          title: "The default export is gone in 2.0.0.",
          keyPoints: [{ text: SHORT_QUOTE, quote: SHORT_QUOTE }, { text: "Named exports cover the same surface." }, { text: "No other API changed." }],
          breakingChanges: [{ change: "The default export is gone", migration: "Use the named export.", quote: SHORT_QUOTE }],
          actionRequired: true,
        },
      },
    ]),
  ]);
  await addFollows(developer.id, [technology.id]);
});

test.afterAll(async () => {
  await developer.clearFollows();
  await Promise.all([developer.remove(), technology.remove()]);
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

// The page is measured whole, and the leaves that stick out are named: knowing a page overflows is
// not enough to fix it, and the element that did it is what the measurement of issue #62 reported.
async function measure(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const leaves = Array.from(document.body.querySelectorAll("*"))
      .filter((element) => element.children.length === 0)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.right > root.clientWidth + 1)
      .map(({ element, rect }) => `${element.tagName.toLowerCase()} +${Math.round(rect.right - root.clientWidth)}px ${(element.textContent ?? "").slice(0, 50)}`);
    return { over: Math.max(0, root.scrollWidth - root.clientWidth), leaves: leaves.slice(0, 5) };
  });
}

async function expectNoOverflow(page: Page, where: string) {
  expect(await measure(page), `horizontal overflow on ${where}`).toEqual({ over: 0, leaves: [] });
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
    });

    test("the public pages stay inside the window", async ({ page }) => {
      for (const path of ["/", "/login", `/technologies/${technology.slug}`, `/technologies/${technology.slug}?from=2.0.0`]) {
        await page.goto(path);
        await expectNoOverflow(page, path);
      }
    });

    test("a release page stays inside the window with the notes closed and open", async ({ page }) => {
      for (const version of ["3.0.0", "4.0.0", "2.0.0"]) {
        const path = `/technologies/${technology.slug}/${version}`;
        await page.goto(path);
        await expect(page.locator("#verdict")).toBeVisible();
        await expectNoOverflow(page, `${path} with the notes closed`);

        await page.locator("#release-notes > summary").click();
        await expect(page.locator("#release-notes")).toHaveAttribute("open", "");
        await expectNoOverflow(page, `${path} with the notes open`);
      }
    });

    test("the signed-in pages stay inside the window", async ({ page }) => {
      await signIn(page);
      for (const path of ["/dashboard", "/technologies"]) {
        await page.goto(path);
        await expectNoOverflow(page, path);
      }
    });
  });
}

test.describe("the caret row", () => {
  const carets = (page: Page) => page.locator("span.text-breaking").filter({ hasText: /^\^+$/ });

  test("stays where the quote fits on one line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/technologies/${technology.slug}/2.0.0`);
    await expect(carets(page).first()).toBeVisible();

    // Below 640px DESIGN.md hands the citation to the underline even for a quote this short.
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(carets(page).first()).toBeHidden();
  });

  test("gives way to the underline for a quote no width fits", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/technologies/${technology.slug}/3.0.0`);
    await expect(carets(page).first()).toBeHidden();
    await expect(page.locator(".cited-quote").first()).toBeVisible();
  });
});

test("the release notes keep scrolling for themselves", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`/technologies/${technology.slug}/3.0.0`);
  await page.locator("#release-notes > summary").click();
  await expect(page.locator("#release-notes ol")).toHaveCSS("overflow-x", "auto");
});

// The bar is **one 56px row at every width**. It was three on every common phone once, 153px
// measured at 375 and 390, then two: 56px plus a 40px strip holding the sections, with the quota
// coming down to share that strip below 430px (issue #47, #119). The strip is gone, because the
// sections moved into the account on a phone and took their 40px with them: 96px held on a 667px
// screen was a seventh of it spent on furniture. What the suite now guards is that the row it left
// behind holds the wordmark, the quota and the actions without growing and without overflowing,
// down to 320px, which is the narrowest width measured here.
test.describe("the top bar is one row on a phone", () => {
  const ONE_ROW = 56 + 1; // the rule under the bar belongs to the header too

  async function dashboardAt(page: Page, width: number): Promise<void> {
    await signIn(page);
    await developer.clearFollows();
    await addFollows(developer.id, [technology.id]);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/dashboard");
  }

  for (const width of [320, 375, 390, 414, 429, 430, 639]) {
    test(`is at most ${ONE_ROW}px at ${width}px, with the quota in it`, async ({ page }) => {
      await dashboardAt(page, width);
      const header = await page.locator("header").boundingBox();
      expect(header?.height, "the header is one row").toBeLessThanOrEqual(ONE_ROW);

      // The quota is what used to force the second row, so it is what this measures: it is in the
      // bar, on the line, not under it.
      // The Standing list carries a name of its own on this page, so the quota is asked for by name.
      const quota = await page.getByLabel("Followed technologies", { exact: true }).boundingBox();
      expect(quota, "the quota").not.toBeNull();
      expect(quota?.y, "the quota is in the bar").toBeLessThan(56);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, "and the one row adds no horizontal overflow").toBeLessThanOrEqual(clientWidth);
    });
  }

  // The row the bar no longer has must not be hiding in the DOM at a height of its own: the
  // sections are `display: none` below 640px, not merely moved.
  test("holds no sections at 390px", async ({ page }) => {
    await dashboardAt(page, 390);
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  });
});
