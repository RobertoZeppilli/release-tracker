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
  // Never switched an external channel on: the whole trial is still in hand, and the line says when
  // it would start rather than how much is left.
  await expect(page.getByText("Your 30 day trial of Slack and email starts")).toBeVisible();

  const day = 24 * 60 * 60 * 1000;
  await setExternalTrial(developer.id, new Date(Date.now() - 29 * day));
  await page.reload();
  await expect(page.getByText("One day left of your trial of Slack and email.")).toBeVisible();

  await setExternalTrial(developer.id, new Date(Date.now() - 30 * day));
  await page.reload();
  await expect(page.getByText("Your trial of Slack and email has ended.")).toBeVisible();
});

test("the external channels carry the Pro mark, and Slack is the one that can be switched on", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  const heading = page.getByRole("heading", { name: /slack and email/ });
  await expect(heading).toContainText("Pro");
  // Four: the two bell switches and the two Slack ones (#172). The email has none, because a switch
  // for a channel that sends nothing would be a promise, and #173 brings its own.
  await expect(page.getByRole("checkbox")).toHaveCount(4);
  // Nothing to prove while there is nowhere to send.
  await expect(page.getByRole("button", { name: "send a test message" })).toBeDisabled();
});

test("the Slack webhook is read back as a hint, never as the URL", async ({ page }) => {
  await signIn(page);
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
  await page.goto("/settings");

  await page.getByLabel("incoming webhook URL").fill("https://hooks.slack.com.example.test/services/T0");
  await page.getByRole("button", { name: "save" }).click();

  // Next keeps its own empty `role="alert"` route announcer in the page, so the error is read
  // by the text it carries, not by the role alone.
  const error = page.getByRole("alert").filter({ hasText: "error:" });
  await expect(error).toContainText("https://hooks.slack.com/services/");
  await expect(page.getByText("No webhook yet")).toBeVisible();
});

test("the language of email and slack is saved, and is not the language of the site", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  await page.getByRole("button", { name: "Write email and Slack in Deutsch" }).click();
  await expect(page.getByRole("button", { name: "Write email and Slack in Deutsch" })).toHaveAttribute(
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
  await expect(page.getByRole("button", { name: "Write email and Slack in Deutsch" })).toHaveAttribute(
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
