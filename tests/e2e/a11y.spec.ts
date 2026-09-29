import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
  addFollows,
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

      await page.goto(`/technologies/${technology.slug}?from=1.8.9`);
      await expect(page.locator("#path-verdict")).toBeVisible();
      await scan(page, theme);
    });

    test("a technology page with an invalid version in the form", async ({ page }) => {
      await page.goto(`/technologies/${technology.slug}?from=9.9.9`);
      await expect(page.locator("#from-message")).toBeVisible();
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
  });
}
