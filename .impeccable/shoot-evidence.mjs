import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const base = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/";
const dir = ".impeccable/review/dashboard";
const b = await chromium.launch();
async function page(file, w, h = 900) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(base + file, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: ".review{display:none!important}" });
  return p;
}
for (const w of [1440, 390]) {
  const p = await page("dashboard.html", w);
  await p.click("#digest details.week >> nth=0 >> summary");
  await p.waitForTimeout(300);
  await (await p.$("#digest")).screenshot({ path: `${dir}/digest-open-${w}.png` });
  console.log("digest", w, await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
let p = await page("technology.html", 700);
await p.screenshot({ path: `${dir}/tech-700.png` });
await (await p.$("section.group")).screenshot({ path: `${dir}/tech-700-v6.png` });
console.log("tech700", await p.evaluate(() => document.documentElement.scrollWidth));
await p.close();
p = await page("technology.html", 1440);
await p.evaluate(() => document.querySelector(".read-more").scrollIntoView({ block: "center" }));
await p.focus(".read-more");
await p.keyboard.press("Shift+Tab"); await p.keyboard.press("Tab");
await p.screenshot({ path: `${dir}/tech-link-focus.png` });
await p.evaluate(() => document.querySelector(".rel-verdict.none").scrollIntoView({ block: "center" }));
await p.screenshot({ path: `${dir}/tech-neutral-row.png` });
await p.close();
await b.close();
