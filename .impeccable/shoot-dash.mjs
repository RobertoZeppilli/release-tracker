import { chromium } from "file:///C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright/index.mjs";
const url = "file:///C:/Users/rober/progetti/release-tracker/design/mocks/dashboard.html";
const dir = ".impeccable/review/dashboard";
const browser = await chromium.launch();
async function open(w, h, state, theme) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: "networkidle" });
  if (theme) await p.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  if (state) await p.evaluate((v) => { const s = document.getElementById("state-select"); s.value = v; s.dispatchEvent(new Event("change")); }, state);
  await p.addStyleTag({ content: ".review{display:none!important}" });
  return p;
}
const shots = [
  [1440, 900, null, null, "desktop.png", true], [1440, 900, null, null, "desktop-fold.png", false],
  [390, 844, null, null, "mobile.png", true], [1440, 900, null, "light", "desktop-light.png", false],
  [1440, 900, "safe", null, "state-safe.png", false], [1440, 900, "empty", null, "state-empty.png", true],
  [390, 844, "empty", null, "mobile-empty.png", true],
];
for (const [w, h, st, th, name, full] of shots) {
  const p = await open(w, h, st, th);
  if (name === "state-empty.png") { await p.click(".follow >> nth=0"); await p.click(".follow >> nth=4"); }
  await p.screenshot({ path: `${dir}/${name}`, fullPage: full });
  if (w === 390) console.log(name, await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
await browser.close();
// cross-mock alignment checks
const b2 = await chromium.launch();
for (const [f, w, name] of [["technology.html", 700, "tech-700.png"], ["technology.html", 390, "tech-mobile.png"], ["release.html", 1440, "release-head.png"]]) {
  const p = await b2.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(`file:///C:/Users/rober/progetti/release-tracker/design/mocks/${f}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: ".review{display:none!important}" });
  await p.screenshot({ path: `${dir}/${name}` });
  console.log(name, await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
await b2.close();
