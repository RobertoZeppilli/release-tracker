import { expect, type Page, test } from "@playwright/test";
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
      for (const version of ["3.0.0", "2.0.0"]) {
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
