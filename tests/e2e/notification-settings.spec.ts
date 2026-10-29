import { expect, type Page, test } from "@playwright/test";
import {
  clearNotificationSettings,
  e2eAuthSecret,
  type FixtureDeveloper,
  savedLocale,
  savedPreference,
  seedDeveloper,
  setExternalTrial,
} from "./fixtures";

// The Notifications section of `/settings` (issue #171). Every switch is saved by a Server Action,
// so what is asserted is twofold: what the page shows after a press, and what the database holds
// underneath it. A press that only moved the mark would be a switch that lies.

let developer: FixtureDeveloper;

test.beforeAll(async () => {
  developer = await seedDeveloper();
});

test.afterAll(async () => {
  await clearNotificationSettings(developer.id);
  await developer.remove();
});

test.beforeEach(async () => {
  await clearNotificationSettings(developer.id);
});

async function signIn(page: Page): Promise<void> {
  const response = await page.request.post("/api/test/session", {
    data: { secret: e2eAuthSecret(), email: developer.email, password: developer.password },
  });
  expect(response.status()).toBe(204);
}

// The thirty days opened from the outside, which is what the Slack zone is gated on. A test that
// needs Slack is not a test about how a trial starts, and the press that starts one has a test of
// its own below.
async function openTrial(): Promise<void> {
  await setExternalTrial(developer.id, new Date());
}

// By what it controls and not by its glyph: `[x]` and `[ ]` are the same control in two states, and
// the name is the thing under test.
function featuredSwitch(page: Page) {
  return page.getByRole("checkbox", { name: "featured releases on the bell" });
}

test("the bell starts on for both events, which is the declared starting point", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("checkbox", { name: "notable releases on the bell" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  // Nothing was saved to make them look on: a missing row is the starting point (ADR 0009).
  expect(await savedPreference(developer.id, "featured_release", "in_app")).toBeNull();
});

test("a press is saved on the server and holds across a reload", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");
  await featuredSwitch(page).click();

  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "false");
  await expect(async () => {
    expect(await savedPreference(developer.id, "featured_release", "in_app")).toBe(false);
  }).toPass();

  // The reload is the test: the mark is drawn from the database on the server, not kept in a script.
  await page.reload();
  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "false");

  // And back on, which is the same write with the other value rather than a second row. The mark
  // turns before the write lands, so the write is waited for here as it is above: a reload that
  // beats it reads the row from before the press and the page is right to draw what it finds
  // (issue #178, where this failed inside the full suite).
  await featuredSwitch(page).click();
  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "true");
  await expect(async () => {
    expect(await savedPreference(developer.id, "featured_release", "in_app")).toBe(true);
  }).toPass();

  await page.reload();
  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "true");
});

test("the switch is reached and pressed by keyboard alone", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  await featuredSwitch(page).focus();
  await expect(featuredSwitch(page)).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(featuredSwitch(page)).toHaveAttribute("aria-checked", "false");
  await expect(async () => {
    expect(await savedPreference(developer.id, "featured_release", "in_app")).toBe(false);
  }).toPass();
});

test("the line of the trial comes from the database, and is true on the last day", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");
  // Not opened yet: there is nothing to count, so nothing is printed and the press is what is there
  // instead. The page used to carry a paragraph here (2026-10-28).
  await expect(page.getByRole("button", { name: "start the 30 day Pro trial" })).toBeVisible();
  await expect(page.getByText("left of the Pro trial")).toHaveCount(0);

  const day = 24 * 60 * 60 * 1000;
  await setExternalTrial(developer.id, new Date(Date.now() - 29 * day));
  await page.reload();
  await expect(page.getByText("One day left of the Pro trial.")).toBeVisible();

  await setExternalTrial(developer.id, new Date(Date.now() - 30 * day));
  await page.reload();
  await expect(page.getByText("The Pro trial has ended.")).toBeVisible();
});

test("Slack carries the Pro mark on its own heading, and is the one that can be switched on", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/settings");

  const heading = page.getByRole("heading", { level: 3, name: "slack Pro" });
  await expect(heading).toContainText("Pro");
  // Four: the two bell switches and the two Slack ones (#172). The email has none, because a switch
  // for a channel that sends nothing would be a promise, and #173 brings its own.
  await expect(page.getByRole("checkbox")).toHaveCount(4);
  // Nothing to prove while there is nowhere to send.
  await expect(page.getByRole("button", { name: "send a test message" })).toBeDisabled();
});

test("the Slack webhook is read back as a hint, never as the URL", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/settings");

  const field = page.getByLabel("incoming webhook URL");
  await field.fill("https://hooks.slack.com/services/T0/B0/E2eTest4321");
  await page.getByRole("button", { name: "save" }).click();

  await expect(page.getByText("Sending to hooks.slack.com/\u20264321")).toBeVisible();
  await expect(page.getByRole("button", { name: "send a test message" })).toBeEnabled();
  // ⚠️ The secret is never printed back: the field stays empty and the page holds the hint alone.
  await expect(field).toHaveValue("");
  await expect(page.locator("body")).not.toContainText("E2eTest4321");

  // An empty field saved is the way back out, and it must leave the switches sending nothing.
  await page.getByRole("button", { name: "save" }).click();
  await expect(page.getByText("No webhook yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "send a test message" })).toBeDisabled();
});

test("a webhook that is not Slack's is refused, and says why", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/settings");

  await page.getByLabel("incoming webhook URL").fill("https://hooks.slack.com.example.test/services/T0");
  await page.getByRole("button", { name: "save" }).click();

  // Next keeps its own empty `role="alert"` route announcer in the page, so the error is read
  // by the text it carries, not by the role alone.
  const error = page.getByRole("alert").filter({ hasText: "error:" });
  await expect(error).toContainText("https://hooks.slack.com/services/");
  await expect(page.getByText("No webhook yet")).toBeVisible();
});

test("the language of slack is saved, and is not the language of the site", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/settings");

  // The channel comes first: the choice appears with it, and that appearing is part of the test.
  await expect(page.getByRole("heading", { level: 3, name: "language of slack" })).toHaveCount(0);
  await page.getByLabel("incoming webhook URL").fill("https://hooks.slack.com/services/T0/B0/E2eLang4321");
  await page.getByRole("button", { name: "save" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "language of slack" })).toBeVisible();

  await page.getByRole("button", { name: "Write Slack in Deutsch" }).click();
  await expect(page.getByRole("button", { name: "Write Slack in Deutsch" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(async () => {
    expect(await savedLocale(developer.id)).toBe("de");
  }).toPass();

  // The site is still English: the language of the page is the one in the address (ADR 0008).
  await expect(page).toHaveURL("/settings");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.getByRole("button", { name: "Write Slack in Deutsch" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the German page keeps its switches at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await signIn(page);
  await page.goto("/de/settings");

  const german = page.getByRole("checkbox", { name: "featured Releases an der Glocke" });
  await expect(german).toHaveAttribute("aria-checked", "true");
  await german.click();
  await expect(german).toHaveAttribute("aria-checked", "false");

  // The press must stay inside the window, which is what the switch's own column is measured by.
  const box = await german.boundingBox();
  expect(box).not.toBeNull();
  if (box) expect(box.x + box.width).toBeLessThanOrEqual(320);
});

// ⚠️ **Two things on this page have no automatic proof, and this is the declaration.** Both need the
// Slack app's credentials, which the CI has not got, so every test here sees the development
// variant: the production layout, the one **without** the field to paste a webhook into (#194),
// and the **dialog** that "Add to Slack" opens before leaving for Slack (#199). Covering them
// needs a second server with fake credentials on a port of its own; it was weighed on 2026-10-28
// and left out, because the half of the dialog that matters -- continue -- would then navigate to
// slack.com from a test. Both are proved by hand in production and written up.
//
// "Add to Slack" (#188). The round itself cannot be driven from here: Slack demands an HTTPS
// `redirect_uri`, so it is proved by hand in production and written up. What is proved here is the
// state the tests and development run in, which is the credentials unset: no button, the webhook
// field still the way in, and the install route saying so instead of leading nowhere.
test("without the Slack app's credentials there is no button, and the install route says so", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/settings");
  await expect(page.getByRole("link", { name: "Add to Slack" })).toHaveCount(0);
  // The field is not hidden by the button existing elsewhere: it is the other way in, and here the
  // only one.
  await expect(page.getByLabel("incoming webhook URL")).toBeVisible();

  await page.goto("/slack/install");
  await expect(page).toHaveURL(/\/settings\?slack=unavailable/);
  await expect(page.getByRole("status").filter({ hasText: "Add to Slack is not available here" })).toBeVisible();
});

// The forged return Slack warns about, which is the half of the round that does not need Slack: a
// `state` the server never signed is refused, and nothing is written for anybody.
test("a return with a state that was not signed here is refused", async ({ page }) => {
  await signIn(page);
  // Slack is behind an open trial, so the trial is opened here: in CI this file runs on the
  // production build, where the press is the only other door (#194).
  await openTrial();
  await page.goto("/slack/callback?code=whatever&state=forged.signature");
  await expect(page).toHaveURL(/\/settings\?slack=(denied|unavailable)/);
  await expect(page.getByText("No webhook yet")).toBeVisible();
});

// The two zones of the page (#194). What is asserted is the structure, not the pixels: an `h2` per
// zone, `h3` inside, and nothing below that. A heading level is assistive reading (WCAG 2.2 AA,
// 1.3.1), so a fourth level creeping back in is a regression a test should catch.
test("the page is two zones, with headings that stop at the third level", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  // Scoped to `main`: the foot of every page carries headings of its own, the language picker
  // among them (ADR 0008), and they are not the structure of this page.
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Settings");
  await expect(main.getByRole("heading", { level: 2 })).toHaveText(["Language", "Notifications"]);
  // The 18px of the zone titles is the token `--text-title`, read off the element so the test says
  // what the reader sees and not which class was written.
  const size = await main
    .getByRole("heading", { level: 2, name: "Notifications" })
    .evaluate((node) => getComputedStyle(node).fontSize);
  expect(size).toBe("18px");
  await expect(main.getByRole("heading", { level: 4 })).toHaveCount(0);
  await expect(main.getByRole("heading", { level: 5 })).toHaveCount(0);

  await expect(main.getByRole("heading", { level: 3, name: "interface language" })).toBeVisible();
  // The language of Slack is not here yet: with no channel it is a preference about nothing, so it
  // is drawn only once Verdict is in a workspace (decided on 2026-10-28). The test below adds one.
  await expect(main.getByRole("heading", { level: 3, name: "language of slack" })).toHaveCount(0);
});

test("at 390px the page does not scroll sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await signIn(page);
  await page.goto("/settings");

  await expect(page.getByRole("heading", { level: 2, name: "Notifications" })).toBeVisible();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

// The press that opens the thirty days (2026-10-28). It is the only door to Slack in production
// until Pro can be bought (#174), so what is asserted is both halves: the row in the database, and
// Slack appearing because of it.
// ⚠️ Run locally with `pnpm dev` this says less than it does in CI: in development the whole of
// Slack is drawn with no trial open, on purpose, so the appearing is only really proved on the
// production build, which is what the CI runs.
test("the press opens the trial, and Slack is there because of it", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  const press = page.getByRole("button", { name: "start the 30 day Pro trial" });
  await expect(press).toBeVisible();
  // What it costs, said where it starts and not inside the dialog of "Add to Slack".
  await expect(page.getByText("30 days, free. After them Slack needs Pro")).toBeVisible();
  await press.click();

  // The countdown is the proof the row was written: the page is rendered again from the database.
  await expect(page.getByText("30 days left of the Pro trial.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "slack Pro" })).toBeVisible();
  await expect(press).toHaveCount(0);
});
