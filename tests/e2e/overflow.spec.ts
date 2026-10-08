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

// The bar DESIGN.md specifies is two rows at 640px and below: 56px plus a 40px strip. It was three
// on every common phone, 153px measured at 375 and 390, because the quota did not fit beside the
// wordmark and the actions. Below 430px the quota comes down into the strip (issue #47, P1-5).
test.describe("the top bar stays two rows on a phone", () => {
  const TWO_ROWS = 56 + 40 + 1; // the rule under the strip belongs to the header too

  async function dashboardAt(page: Page, width: number): Promise<void> {
    await signIn(page);
    await developer.clearFollows();
    await addFollows(developer.id, [technology.id]);
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/dashboard");
  }

  for (const width of [320, 375, 390, 414, 429]) {
    test(`is at most ${TWO_ROWS}px at ${width}px`, async ({ page }) => {
      await dashboardAt(page, width);
      const header = await page.locator("header").boundingBox();
      expect(header?.height).toBeLessThanOrEqual(TWO_ROWS);
    });
  }

  // The two phones the review measured. Above the step the quota is back in the bar, where the three
  // items fit on one line and the strip is the sections alone.
  for (const width of [375, 390]) {
    test(`puts the quota in the strip at ${width}px`, async ({ page }) => {
      await dashboardAt(page, width);
      const quota = await page.getByLabel("Followed technologies").boundingBox();
      expect(quota?.y).toBeGreaterThanOrEqual(56);
    });
  }

  test("keeps the quota in the bar from 430px up", async ({ page }) => {
    await dashboardAt(page, 430);
    const quota = await page.getByLabel("Followed technologies").boundingBox();
    expect(quota?.y).toBeLessThan(56);
  });

  // Below 430px the strip carries both the sections and the quota, on one line. Before issue #119
  // the sections were in the account panel and the quota had the strip to itself; now they share it,
  // sections at the left edge and quota at the right, and that sharing is what keeps the bar at two
  // rows. 320px is the narrowest width the suite measures.
  for (const width of [320, 375, 390]) {
    test(`shares the strip between the sections and the quota at ${width}px`, async ({ page }) => {
      await dashboardAt(page, width);
      const sections = await page.getByRole("navigation", { name: "Sections" }).boundingBox();
      const quota = await page.getByLabel("Followed technologies").boundingBox();
      expect(sections, "the sections").not.toBeNull();
      expect(quota, "the quota").not.toBeNull();
      if (!sections || !quota) return;

      expect(sections.y, "the sections are in the strip, not the bar").toBeGreaterThanOrEqual(56);
      // The middle of each, not the top: the quota is a link centred in the 40px line, so its own
      // box starts lower than the strip it sits in.
      const middle = (box: { y: number; height: number }) => box.y + box.height / 2;
      expect(Math.abs(middle(quota) - middle(sections)), "the quota shares the line").toBeLessThan(1);
      expect(quota.x, "and sits to the right of the sections").toBeGreaterThanOrEqual(sections.x + sections.width - 1);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, "the shared strip adds no horizontal overflow").toBeLessThanOrEqual(clientWidth);
    });
  }
});
