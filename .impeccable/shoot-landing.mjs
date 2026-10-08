import { chromium } from "../node_modules/.pnpm/playwright@1.63.0/node_modules/playwright/index.mjs";

const url = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/landing.html";
const out = ".impeccable/review";
const browser = await chromium.launch();

async function open(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return page;
}

let page = await open(1440, 900);
await page.screenshot({ path: `${out}/landing-fold.png` });
await page.screenshot({ path: `${out}/landing-desktop.png`, fullPage: true });
await page.evaluate(() => document.getElementById("stage-cite").scrollIntoView({ block: "center" }));
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/landing-cite.png` });
await page.close();

page = await open(1440, 900);
await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
await page.screenshot({ path: `${out}/landing-light.png`, fullPage: true });
await page.close();

page = await open(390, 844);
await page.screenshot({ path: `${out}/landing-mobile.png`, fullPage: true });
await page.close();

// Anything wider than the viewport is a defect, at every width the app claims.
for (const width of [320, 390, 640, 1024, 1440]) {
  const probe = await open(width, 900);
  const overflow = await probe.evaluate(() => {
    const wide = [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className || "-"}`);
    return { scrollWidth: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, wide: [...new Set(wide)].slice(0, 6) };
  });
  console.log(width, JSON.stringify(overflow));
  await probe.close();
}

await browser.close();
