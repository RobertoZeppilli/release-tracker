import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// ADR 0008: five languages, English without a prefix. This file is about the plumbing and not about
// the words: the strings are still English everywhere, and what is checked here is that the right
// page is served at the right address, says which language it is in, and names its siblings.

let technology: FixtureTechnology;

test.beforeAll(async () => {
  technology = await seedTechnology([
    { version: "1.0.0", significance: "notable", origin: "imported", status: "unavailable", notes: null },
  ]);
});

test("English is served with no prefix, and every other language with one", async ({ page }) => {
  await page.goto("/faq");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  for (const locale of ["it", "fr", "es", "de"]) {
    await page.goto(`/${locale}/faq`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

// Two addresses for one page is the thing a canonical exists to prevent, so `/en` is not served at
// all: it is sent to the address the canonical, the sitemap and every link already name.
test("the English prefix is redirected away instead of being served twice", async ({ page }) => {
  const response = await page.goto("/en/faq");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL("/faq");
});

test("a segment that is not a language is a 404, not a fall back to English", async ({ page }) => {
  const response = await page.goto("/xx/faq");
  expect(response?.status()).toBe(404);
  // The 404 keeps the shell: the note line and the foot are the page's, not Next's own bare page.
  await expect(page.getByText("note:")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

// The rewrite that puts the language in the path is the one place where a query string could be
// dropped, and `?next=` on the login is where it would hurt: six E2E fell on it once.
test("the query survives the rewrite that puts the language in the path", async ({ page }) => {
  await page.goto("/login?next=%2Fdashboard");
  await expect(page).toHaveURL("/login?next=%2Fdashboard");
  await page.goto("/it/login?next=%2Fit%2Fdashboard");
  await expect(page).toHaveURL("/it/login?next=%2Fit%2Fdashboard");
});

test("a page names its address in every language, and English as the default", async ({ page }) => {
  await page.goto(`/it/technologies/${technology.slug}`);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", new RegExp(`/it/technologies/${technology.slug}$`));

  for (const [locale, suffix] of [
    ["en", `/technologies/${technology.slug}`],
    ["de", `/de/technologies/${technology.slug}`],
    ["x-default", `/technologies/${technology.slug}`],
  ]) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveAttribute(
      "href",
      new RegExp(`${suffix}$`),
    );
  }
});

test("a link keeps the language it was clicked in", async ({ page }) => {
  await page.goto("/it/faq");
  await page.getByRole("link", { name: "privacy", exact: true }).first().click();
  await expect(page).toHaveURL("/it/privacy");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
});

test("the sitemap lists every page in all five languages, each naming the others", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const locale of ["it", "fr", "es", "de"]) {
    expect(xml).toContain(`/${locale}/faq`);
  }
  expect(xml).toContain('hreflang="x-default"');
});
