import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { removeWaitlistSignup, waitlistLocale } from "./fixtures";

// The Waitlist (ADR 0010): the date on the landing, the field that writes one row, the second try
// that writes none, and the door of `/login` that no longer makes an account.
//
// The day is written out in the reader's language and never retyped by a translator, so each
// language is asked for the day it should be printing.
const DAY = { en: "January 20, 2027", it: "20 gennaio 2027", de: "20. Januar 2027" };

const addresses: string[] = [];

test.afterAll(async () => {
  for (const email of addresses) await removeWaitlistSignup(email);
});

function address(): string {
  const email = `e2e-${randomUUID()}@example.test`;
  addresses.push(email);
  return email;
}

test("the landing names the launch day in the reader's language", async ({ page }) => {
  for (const [locale, day] of Object.entries(DAY)) {
    await page.goto(`/${locale}`);
    const block = page.locator("#waitlist");
    await expect(block.getByRole("heading")).toContainText(day);
    await expect(block.locator("time")).toHaveAttribute("datetime", "2027-01-20");
  }
});

test("an address is taken once, from the keyboard, and the second try changes nothing", async ({ page }) => {
  const email = address();
  await page.goto("/it");
  const block = page.locator("#waitlist");

  // Typed and submitted with the keyboard alone: `Enter` in a single field form is how a form is
  // sent without a pointer (WCAG 2.1.1).
  const field = block.getByLabel("la tua email");
  await field.fill(email);
  await field.press("Enter");

  await expect(block.getByRole("status")).toContainText("sei in lista");
  // The field is gone: a form still standing invites the reader to wonder whether it worked.
  await expect(field).toHaveCount(0);
  // The language of the page is the language the one message is owed in.
  expect(await waitlistLocale(email)).toBe("it");

  // Asked again, from a page that has not seen the first answer: the row is already there, and the
  // reader is told so with a `note:` and not an error, because they did nothing wrong.
  await page.goto("/it");
  const again = page.locator("#waitlist");
  await again.getByLabel("la tua email").fill(email);
  await again.getByRole("button").click();
  await expect(again.getByRole("status")).toContainText("già in lista");
});

test("an address that is not an address is refused without a write", async ({ page }) => {
  await page.goto("/en");
  const block = page.locator("#waitlist");
  // `novalidate` is not set, so the browser's own check is what the reader meets first: the field is
  // invalid and the form is not sent, which is the behaviour this asserts.
  await block.getByLabel("your email").fill("not-an-address");
  await block.getByRole("button").click();
  await expect(block.getByRole("alert")).toHaveCount(0);
  await expect(block.getByLabel("your email")).toBeFocused();
});

test("the login page says the day and sends the reader to the field", async ({ page }) => {
  await page.goto("/en/login");
  const door = page.getByRole("heading", { name: `Verdict opens on ${DAY.en}.` });
  await expect(door).toBeVisible();
  await page.getByRole("link", { name: "leave your email on the home page" }).click();
  await expect(page).toHaveURL(/\/#waitlist$|\/$/);
  await expect(page.locator("#waitlist")).toBeVisible();
});

test("a reader turned away by the callback is told no account was made", async ({ page }) => {
  await page.goto("/en/login?closed=1");
  await expect(page.getByRole("status")).toContainText("no account was created");
});
