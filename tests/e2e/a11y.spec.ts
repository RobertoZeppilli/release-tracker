import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
  declareCurrentVersion,
  e2eAuthSecret,
  type FixtureDeveloper,
  type FixtureFillers,
  type FixtureTechnology,
  seedDeveloper,
  seedFillers,
  seedTechnology,
} from "./fixtures";

const FREE_LIMIT = 10;

// The audit of the acceptance criteria of issue #23: every page, in both themes, checked by axe
// against WCAG 2.2 AA, then the keyboard walked through each flow. What axe cannot see is checked
// elsewhere: token contrast in `src/app/theme-contrast.test.ts`, which reads the palette itself.

const THEMES = ["dark", "light"] as const;
type Theme = (typeof THEMES)[number];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

let developer: FixtureDeveloper;
let technology: FixtureTechnology;
// Empty Technologies, only there to fill the Free limit so a refused follow can be reached.
let fillers: FixtureFillers;

test.beforeAll(async () => {
  [developer, fillers, technology] = await Promise.all([
    seedDeveloper(),
    seedFillers(FREE_LIMIT),
    // One Technology rich enough to fill every part of the pages: a breaking Summary with a citation
    // to underline, a safe one, a preview and a digest release to fold.
    seedTechnology([
      {
        version: "2.0.0",
        significance: "featured",
        origin: "detected",
        status: "ready",
        notes: "# 2.0.0\n\nThe default export is gone.\n\nUse the named export instead.",
        actionRequired: true,
        publishedAt: daysAgo(3),
        summary: {
          title: "The default export is gone in 2.0.0.",
          keyPoints: [
            { text: "The default export is gone.", quote: "The default export is gone." },
            { text: "Named exports cover the same surface." },
            { text: "No other API changed." },
          ],
          breakingChanges: [
            {
              change: "The default export is gone",
              migration: "Use the named export.",
              quote: "The default export is gone.",
            },
          ],
          actionRequired: true,
        },
      },
      { version: "1.9.0", significance: "notable", origin: "detected", status: "ready", notes: "Adds a flag.", actionRequired: false, publishedAt: daysAgo(8) },
      { version: "2.1.0-beta.1", significance: "preview", origin: "detected", status: "pending", notes: "Early build.", publishedAt: daysAgo(2) },
      { version: "1.8.9", significance: "digest", origin: "detected", status: "skipped", notes: "Fixes a crash.", publishedAt: daysAgo(5) },
    ]),
  ]);
});

test.afterAll(async () => {
  await developer.clearFollows();
  await Promise.all([developer.remove(), technology.remove(), fillers.remove()]);
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

// The theme is stored, and the init script reads it before the first paint: the same path a
// returning Developer takes, so nothing has to be toggled after the page is up.
async function useTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => window.localStorage.setItem("theme", value), theme);
}

async function scan(page: Page, theme: Theme): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const readable = violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
  expect(readable, `axe on ${page.url()} in the ${theme} theme`).toEqual([]);
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await useTheme(page, theme);
    });

    test("home", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await scan(page, theme);
    });

    test("login", async ({ page }) => {
      await page.goto("/login");
      await scan(page, theme);
    });

    // Both shells below are served without the layout and rendered on the client, so the theme
    // reaches them by a different road than everywhere else: it is asserted, not assumed.
    test("the 404", async ({ page }) => {
      await page.goto("/no-such-page");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("no page at this address");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await scan(page, theme);
    });

    // Reached through the test-only page that fails on purpose; see `errors.spec.ts`.
    test("the error page", async ({ page }) => {
      await page.goto("/test/throw");
      await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await scan(page, theme);
    });

    test("technologies, with a follow the database refused", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await addFollows(developer.id, fillers.ids.slice(0, FREE_LIMIT - 1));
      await page.goto("/technologies");
      const follow = page.getByRole("button", { name: `Follow ${technology.name}` });
      await expect(follow).toBeVisible();

      // The tenth follow arrives from another session, so this page still believes there is room.
      await addFollows(developer.id, fillers.ids.slice(FREE_LIMIT - 1));
      await follow.click();
      await expect(page.locator(`#err-${technology.slug}`)).toBeVisible();
      await scan(page, theme);
    });

    test("technologies, with the picker toggles", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await page.goto("/technologies");
      await expect(page.getByRole("button", { name: `Follow ${technology.name}` })).toBeVisible();
      await scan(page, theme);
    });

    test("a technology page and its upgrade path", async ({ page }) => {
      await page.goto(`/technologies/${technology.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(technology.name);
      await scan(page, theme);

      // The path arrives on a client that reads `?from=`, while the Suspense fallback beside it is the
      // same markup with the same ids (#83, #100): an id can name both copies while the second
      // arrives. Waiting for the sentence that opens the path at the version asked waits for the
      // only render that can say it, and would fail if the page ever stopped reading `?from=`.
      await page.goto(`/technologies/${technology.slug}?from=1.8.9`);
      await expect(page.getByText("Between 1.8.9 and 2.0.0 there are 2 releases")).toBeVisible();
      await scan(page, theme);
    });

    test("a technology page with an invalid version in the form", async ({ page }) => {
      // Same reason as above: the refusal names the version refused, which the fallback never does.
      await page.goto(`/technologies/${technology.slug}?from=9.9.9`);
      await expect(page.getByText("9.9.9 is newer than 2.0.0, the latest stable release.")).toBeVisible();
      await scan(page, theme);
    });

    test("a technology page with a declared Version in use, and a refused one", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await addFollows(developer.id, [technology.id]);
      await declareCurrentVersion(developer.id, technology.id, "1.9.0");
      await page.goto(`/technologies/${technology.slug}`);
      await expect(page.locator("#current-version-note")).toContainText("declared on");
      await scan(page, theme);

      await page.getByLabel("Version in use", { exact: true }).fill("9.9.9");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(page.locator("#current-version-note")).toContainText("error:");
      await scan(page, theme);
    });

    test("a release page with a ready summary", async ({ page }) => {
      await page.goto(`/technologies/${technology.slug}/2.0.0`);
      await expect(page.locator("#verdict")).toBeVisible();
      await scan(page, theme);

      // The folded release notes are part of the page: open them before the scan sees them.
      await page.locator("#release-notes > summary").click();
      await expect(page.locator("#release-notes")).toHaveAttribute("open", "");
      await scan(page, theme);
    });

    test("a release page still waiting for its summary", async ({ page }) => {
      await page.goto(`/technologies/${technology.slug}/2.1.0-beta.1`);
      await expect(page.getByLabel("Summary status")).toBeVisible();
      await scan(page, theme);
    });

    test("the empty dashboard and its catalog picker", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await page.goto("/dashboard");
      await expect(page.locator("#empty-status, #page-verdict").first()).toBeVisible();
      await scan(page, theme);
    });

    test("the dashboard with something that needs action", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await addFollows(developer.id, [technology.id]);
      await page.goto("/dashboard");
      await expect(page.locator("#page-verdict")).toContainText("needs action");
      await scan(page, theme);
    });

    test("the dashboard with a Version in use", async ({ page }) => {
      await signIn(page);
      await developer.clearFollows();
      await addFollows(developer.id, [technology.id]);
      await declareCurrentVersion(developer.id, technology.id, "1.8.9");
      await page.goto("/dashboard");
      await expect(page.getByTestId("in-use-counts")).toContainText("version in use · 1 of 1");
      await scan(page, theme);
    });
  });
}

// WCAG 2.2 AA 2.5.8. axe lets both of these pass on the spacing exception, so the size is asserted
// here: they sit in the top bar rather than inside a sentence, so neither has the inline exemption,
// and at the Label line height they measured 20.8px before issue #47.
test.describe("target size in the top bar", () => {
  const MINIMUM = 24;

  test("sign out is at least 24 by 24", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /^Account/ }).click();
    const box = await page.getByRole("button", { name: "sign out" }).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(MINIMUM);
    expect(box?.height).toBeGreaterThanOrEqual(MINIMUM);
  });

  test("sign in is at least 24 by 24", async ({ page }) => {
    await page.goto("/technologies");
    const box = await page.getByRole("link", { name: "sign in" }).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(MINIMUM);
    expect(box?.height).toBeGreaterThanOrEqual(MINIMUM);
  });
});

// WCAG 2.2 AA 2.5.8 again, on the lists rather than on the bar. A version link is 40 x 15px, so it
// only ever passes on the spacing exception: the 24px circle centred on each one must reach no
// other target. The folded digest list of the Technology page failed it by 1.2px (22.8px pitch, from
// a 2px row gap), and nothing else on these three pages comes close, so the assertion is the whole
// rule over every pair and not a gap read off one element.
test.describe("target spacing in the lists", () => {
  const MINIMUM = 24;

  type Target = { label: string; x: number; y: number };

  async function targets(page: Page): Promise<Target[]> {
    return page.$$eval('a[href^="/technologies/"]', (nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return {
          label: (node.textContent ?? "").trim().slice(0, 24),
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        };
      }),
    );
  }

  async function expectSpaced(page: Page, atLeast: number): Promise<void> {
    const found = await targets(page);
    expect(found.length, "there are targets to measure").toBeGreaterThanOrEqual(atLeast);
    const tight = [];
    for (let i = 0; i < found.length; i += 1) {
      for (let j = i + 1; j < found.length; j += 1) {
        const distance = Math.hypot(found[j].x - found[i].x, found[j].y - found[i].y);
        if (distance < MINIMUM) tight.push(`${found[i].label} to ${found[j].label}: ${distance.toFixed(1)}px`);
      }
    }
    expect(tight, `pairs closer than ${MINIMUM}px centre to centre`).toEqual([]);
  }

  // The folded list needs a major with digest Releases in it, which the imported Catalog has and a
  // fixture of four Releases does not.
  test("the folded digest list of a Technology page", async ({ page }) => {
    await page.goto("/technologies/vite");
    const folds = page.locator("details summary");
    for (let i = 0; i < (await folds.count()); i += 1) await folds.nth(i).click();
    await expectSpaced(page, 2);
  });

  test("the Dashboard, where a version link sits beside a Technology name", async ({ page }) => {
    await signIn(page);
    await developer.clearFollows();
    await addFollows(developer.id, [technology.id]);
    await page.goto("/dashboard");
    await expectSpaced(page, 2);
  });

  // The Catalog splits its sections on the client once the follows answer, so the names arrive after
  // the first paint: the wait is for the list, not for the page.
  test("the Catalog, at 390px", async ({ page }) => {
    await signIn(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/technologies");
    await page.locator('a[href^="/technologies/"]').first().waitFor();
    await expectSpaced(page, 2);
  });
});
