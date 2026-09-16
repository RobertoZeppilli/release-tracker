import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const url = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/release.html";
const browser = await chromium.launch();
const hideReview = ".review{display:none!important}";
async function open(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: hideReview });
  return page;
}
let page = await open(1440, 900);
await page.screenshot({ path: ".impeccable/review/desktop.png", fullPage: true });
await page.screenshot({ path: ".impeccable/review/desktop-fold.png" });
await page.click('[data-cite="16-17"]'); await page.waitForTimeout(900);
await page.screenshot({ path: ".impeccable/review/desktop-cite.png" });
await page.close();
page = await open(390, 844);
await page.screenshot({ path: ".impeccable/review/mobile.png", fullPage: true });
await page.close();
page = await open(1440, 900);
await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
await page.screenshot({ path: ".impeccable/review/desktop-light.png" });
await page.close();
for (const st of ["ready-safe", "pending", "unavailable", "skipped", "failed"]) {
  page = await open(1440, 900);
  await page.evaluate((s) => { document.getElementById("content").dataset.state = s; }, st);
  await page.screenshot({ path: `.impeccable/review/state-${st}.png` });
  await page.close();
}
await browser.close();
