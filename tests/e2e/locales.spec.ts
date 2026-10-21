import { expect, test } from "@playwright/test";
import { type FixtureTechnology, seedTechnology } from "./fixtures";

// ADR 0008: five languages, English without a prefix. This file is about the plumbing and not about
// the words: what is checked here is that the right page is served at the right address, says which
// language it is in, and names its siblings. The words themselves are checked where they are
// written: the app in its own specs, the landing in `landing.spec`, the five document pages in
// `legal.spec`.

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

// ⚠️ The link is found by the Italian phrase and not by `privacy`: the one in the prose is named
// from the dictionary now (#131), and `privacy` on its own would have matched the foot instead and
// passed while testing nothing about the page.
test("a link keeps the language it was clicked in", async ({ page }) => {
  await page.goto("/it/faq");
  await page.getByRole("link", { name: "informativa sulla privacy" }).first().click();
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

// The picker, which is what makes the five languages a choice instead of five addresses. ADR 0008
// puts it in the foot for the reason the No Dead End Rule gives: a visitor, on a public page, at
// phone width, with no account to find it in.
test("a visitor reaches the picker in the foot at 390px and changes language with it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/faq");
  const picker = page.locator("footer").getByRole("navigation", { name: "language" });
  await expect(picker).toBeVisible();
  // English is where the reader is, and the picker says so rather than offering it as a way out.
  await expect(picker.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");

  await picker.getByRole("link", { name: "Italiano" }).click();
  await expect(page).toHaveURL("/it/faq");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  // And from inside Italian it offers the way back, with the English address carrying no prefix.
  // ⚠️ The picker is found by `lingua` and not by `language`: its accessible name is a string of the
  // dictionary, so on an Italian page it is the Italian word (#131).
  const italian = page.locator("footer").getByRole("navigation", { name: "lingua" });
  await expect(italian.getByRole("link", { name: "English" })).toHaveAttribute("href", "/faq");
});

// The picker writes the query onto the anchor as it is clicked, because `usePathname` has not got it
// and `useSearchParams` in the foot of the root layout would cost the ISR of all 70 pages.
test("changing language keeps the query the reader was looking at", async ({ page }) => {
  await page.goto("/login?next=%2Fdashboard");
  await page.locator("footer").getByRole("navigation", { name: "language" }).getByRole("link", { name: "Deutsch" }).click();
  await expect(page).toHaveURL("/de/login?next=%2Fdashboard");
});

// Nothing in the interface says what language it is in; a Release page in another language says that
// the Summary and the notes are not in it (ADR 0008). It is the one place the product admits the
// page is mixed, and it admits it before the Summary is read.
test("a Release page outside English says the summary and the notes are in English", async ({ page }) => {
  // Its own fixture, with a Summary and notes on it: the shared one carries neither, and a page
  // with nothing in the other language has nothing to declare, which the last assertion here is.
  const summarized = await seedTechnology([
    { version: "1.0.0", significance: "featured", origin: "imported", status: "ready", notes: "Notes.", actionRequired: false },
  ]);

  // The sentence is read in the language of the page, which is the point of it: an Italian reader
  // is told `in inglese`, not `in English` (#131).
  await page.goto(`/it/technologies/${summarized.slug}/1.0.0`);
  await expect(page.getByRole("note")).toContainText("la sintesi e le note di rilascio sono in inglese");

  // On the English page there are not two languages to tell apart, so nothing is said.
  await page.goto(`/technologies/${summarized.slug}/1.0.0`);
  await expect(page.getByText("the summary and the release notes are in English")).toHaveCount(0);

  // And nothing is said in Italian either on a Release with no notes and no Summary: there is no
  // other language on the screen to declare.
  await page.goto(`/it/technologies/${technology.slug}/1.0.0`);
  await expect(page.getByText("la sintesi e le note di rilascio sono in inglese")).toHaveCount(0);
});
