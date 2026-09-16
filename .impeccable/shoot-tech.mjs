import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const url = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/technology.html";
const browser = await chromium.launch();
async function open(w, h) { const p = await browser.newPage({ viewport: { width: w, height: h } }); await p.goto(url, { waitUntil: "networkidle" }); await p.addStyleTag({ content: ".review{display:none!important}" }); return p; }
const dir = ".impeccable/review/technology";
let p = await open(1440, 900);
await p.screenshot({ path: `${dir}/desktop.png`, fullPage: true });
await p.screenshot({ path: `${dir}/desktop-fold.png` });
await p.click(".digest summary"); await p.waitForTimeout(300);
await p.screenshot({ path: `${dir}/desktop-digest-open.png`, fullPage: true });
await p.close();
p = await open(390, 844); await p.screenshot({ path: `${dir}/mobile.png`, fullPage: true }); await p.close();
p = await open(1440, 900); await p.evaluate(() => { document.documentElement.dataset.theme = "light"; }); await p.screenshot({ path: `${dir}/desktop-light.png` }); await p.close();
for (const st of ["invalid", "retired"]) {
  p = await open(1440, 900);
  await p.evaluate((v) => { const s = document.getElementById("state-select"); s.value = v; s.dispatchEvent(new Event("change")); }, st);
  await p.screenshot({ path: `${dir}/state-${st}.png` });
  await p.close();
}
await browser.close();
