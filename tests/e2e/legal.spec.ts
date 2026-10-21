import { expect, test } from "@playwright/test";

// Issue #132: the five pages that say what the product is, and the foot that makes them reachable.
// What is checked here is what the acceptance criteria claim, not that the prose reads well: that
// the pages exist and are indexable, that every page of the app opens all five at every width, and
// that the sign-in points at the terms before the button that signs.

// The Italian heading is here beside the English one (#131) because the pair is the thing worth
// checking: a page whose tab and heading drifted apart, or whose foot entry calls it by a word the
// page does not answer to, is only visible when both are read at once.
const PAGES = [
  { path: "/terms", heading: "Terms of service", italian: "Termini di servizio" },
  { path: "/privacy", heading: "Privacy", italian: "Privacy" },
  { path: "/attributions", heading: "Attributions", italian: "Attribuzioni" },
  { path: "/faq", heading: "FAQ", italian: "FAQ" },
  { path: "/contact", heading: "Contact", italian: "Contatti" },
] as const;

// The two that bind, as opposed to the three that describe: they are the ones that say which
// language holds (#131).
const BINDING = ["/terms", "/privacy"] as const;

const FOOT_LINKS = ["faq", "contact", "terms", "privacy", "attributions"] as const;

for (const { path, heading } of PAGES) {
  test(`${path} is a public page that says when its text last changed`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByText(/last updated: \d{4}-\d{2}-\d{2}/)).toBeVisible();
    // Indexable, unlike the pages behind the sign-in: no `noindex`, and a canonical of its own.
    await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator("head link[rel=canonical]")).toHaveAttribute(
      "href",
      `http://localhost:3000${path}`,
    );
  });
}

// The foot is in the layout, so the three pages below are three different shapes of page: one
// prerendered, one behind nothing but with a form, and one that renders the root again on the
// client. 390px is in the list because the criterion says "from every page, at 390px included,
// with nothing to open".
for (const width of [1280, 390]) {
  test(`every page reaches all five from the foot at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });

    for (const path of ["/", "/login", "/no-such-page"]) {
      await page.goto(path);
      const foot = page.locator("footer");
      for (const label of FOOT_LINKS) {
        await expect(foot.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
    }

    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "terms", exact: true }).click();
    await expect(page).toHaveURL("/terms");
  });
}

// The words, which `locales.spec` deliberately does not check: that file is about the plumbing.
// What is checked here is that the page is in Italian from the tab down to the date, because the
// heading alone would pass on `Privacy` and `FAQ`, which are the same word in both languages.
for (const { path, italian } of PAGES) {
  test(`/it${path} is read in Italian, heading and date together`, async ({ page }) => {
    await page.goto(`/it${path}`);

    await expect(page.getByRole("heading", { name: italian, level: 1 })).toBeVisible();
    await expect(page.getByText(/ultimo aggiornamento: \d{4}-\d{2}-\d{2}/)).toBeVisible();
    await expect(page.getByText(/last updated:/)).toHaveCount(0);
  });
}

// The other three languages, checked by the one line every one of the five pages carries: the date
// line is `doc.updated`, so a page served with the English dictionary says `last updated` and is
// caught here. The heading is not what is read for them, the way it is for Italian: `FAQ` and
// `Privacy` are the same word in all five languages, and the words these three pages do not share
// with English are exactly the ones a parity test already proved are present.
// ⚠️ Unreviewed by native speakers (ADR 0008), so what is asserted is that the page is in the
// language, never that the sentence is the right one to be in it.
const DATED = [
  { locale: "fr", updated: /dernière mise à jour : \d{4}-\d{2}-\d{2}/ },
  { locale: "es", updated: /última actualización: \d{4}-\d{2}-\d{2}/ },
  { locale: "de", updated: /zuletzt aktualisiert: \d{4}-\d{2}-\d{2}/ },
] as const;

for (const { locale, updated } of DATED) {
  test(`the five pages are read in ${locale}, with no English line left in them`, async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(`/${locale}${path}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText(updated)).toBeVisible();
      await expect(page.getByText(/last updated:/)).toHaveCount(0);
    }
  });
}

// Five translations are not five contracts: the English text holds, and the two pages that bind say
// so themselves rather than leaving a reader to wonder which one they agreed to. The three that
// describe do not say it, because a mistranslation there is a bug to fix and not a conflict.
test("the two binding pages say which language holds, and the other three do not", async ({ page }) => {
  const sentence = /Dove non coincidono, è il testo inglese quello che vale/;

  for (const path of BINDING) {
    await page.goto(`/it${path}`);
    await expect(page.getByText(sentence)).toBeVisible();
    // In English too: there it tells the reader theirs is the text that holds.
    await page.goto(path);
    await expect(page.getByText(/the English text is the one that holds/)).toBeVisible();
  }

  for (const { path } of PAGES.filter(({ path }) => !BINDING.some((bound) => bound === path))) {
    await page.goto(`/it${path}`);
    await expect(page.getByText(sentence)).toHaveCount(0);
  }
});

// And the same clause in the three languages that arrived last: a page that binds has to say which
// language holds in the language of the reader who is being bound, or the sentence is doing nothing
// for the only person it is written for.
test("the two binding pages say which language holds in the other three languages too", async ({ page }) => {
  const clauses = [
    { locale: "fr", clause: /c’est le texte anglais qui fait foi/ },
    { locale: "es", clause: /es el texto en inglés el que vale/ },
    { locale: "de", clause: /gilt der englische Text/ },
  ] as const;

  for (const { locale, clause } of clauses) {
    for (const path of BINDING) {
      await page.goto(`/${locale}${path}`);
      await expect(page.getByText(clause)).toBeVisible();
    }
    await page.goto(`/${locale}/faq`);
    await expect(page.getByText(clause)).toHaveCount(0);
  }
});

// The guard of issue #62, on the five pages it has not seen: prose at 390px is the width where a
// long address or an unbreakable word pushes the document sideways.
// ⚠️ Italian is in the loop and not only English: its prose is the longer of the two, and a word
// like `identificatore` in the 22ch column of the privacy table is exactly what pushes a document
// sideways at this width.
test("none of the five is wider than a phone, in either language", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });

  for (const path of PAGES.flatMap(({ path }) => [path, `/it${path}`])) {
    await page.goto(path);
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      window: window.innerWidth,
    }));
    expect(widths.document, `${path} at 390px`).toBeLessThanOrEqual(widths.window);
  }
});

// A short page is the one the foot is wrong on: the 404 has three lines of content, and a foot
// that followed them sat halfway up an empty screen.
test("the foot rests on the bottom of the window on a page too short to fill it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/no-such-page");

  const foot = await page.locator("footer").boundingBox();
  if (!foot) throw new Error("no footer");
  expect(foot.y + foot.height, "the foot ends at the bottom of the window").toBeGreaterThan(880);
  // And it is there without a page to scroll: the body is exactly the window, not taller.
  const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
  expect(scrolls, "the short page does not scroll").toBe(false);
});

test("the foot carries the wordmark, and it opens the landing", async ({ page }) => {
  await page.goto("/terms");

  await page.locator("footer").getByRole("link", { name: "verdict:" }).click();
  await expect(page).toHaveURL("/");
});

test("a page whose path is one step opens on its heading, with no breadcrumb over it", async ({ page }) => {
  for (const path of ["/login", "/terms", "/faq"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(0);
  }
});

test("the sign-in points at the terms before the button that signs", async ({ page }) => {
  await page.goto("/login");

  const terms = page.getByRole("main").getByRole("link", { name: "terms", exact: true });
  const button = page.getByRole("button", { name: "Continue with GitHub" });
  await expect(terms).toBeVisible();
  await expect(button).toBeVisible();

  // Before it in the document, which is what a reader meets first and what a screen reader reads
  // first: a link under the button would be a condition shown after the click that accepts it.
  const order = await terms.evaluate(
    (node, other) => node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING,
    await button.elementHandle(),
  );
  expect(order).toBeTruthy();
});

test("the sitemap lists the five pages", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();

  for (const { path } of PAGES) {
    expect(body).toContain(`<loc>http://localhost:3000${path}</loc>`);
  }
});
