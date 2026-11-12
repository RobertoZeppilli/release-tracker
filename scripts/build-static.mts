// Builds the public showcase: the same source as the app, minus everything that needs a server,
// exported as files (issue #215). `pnpm build:static`.
//
// ⚠️ Why it copies the tree instead of just setting `output: "export"`: that setting is global and
// refuses a Server Action or a route handler **anywhere** under `src/app`, even one on a page that
// is not being exported. The non-public routes have to be out of the tree the build reads, and
// taking them out of the repository is not an option: the app with the server is what gets
// installed. So the build reads a copy, and the copy is what gets cut.
//
// What comes out is `out/` at the root of the repository, which is what the Vercel project serves.

import { cp, mkdir, readdir, readFile, rename, rm, symlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { STATIC_NOT_FOUND_SEGMENT } from "@/lib/static-site";
import { DEFAULT_LOCALE, LOCALES } from "@/modules/i18n";

const ROOT = process.cwd();
const WORK = path.join(ROOT, ".static-build");
const OUT = path.join(ROOT, "out");

// Not copied: the two things that are huge and the three that say nothing to a build.
const SKIPPED = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "out",
  ".static-build",
  "test-results",
  "playwright-report",
  "supabase",
]);

// The routes that need a server, named one by one rather than matched by a pattern: a pattern is a
// rule nobody reads again, and this list is the answer to "what is the public site" (issue #215).
// ⚠️ A route taken out here has to be a route no public page links to, or the showcase carries a
// 404 in its own markup. What those links were, and where they went instead, is in the components:
// `STATIC_SITE` in `site-header-bar.tsx`, `technology-follow.tsx`, `entry-action.tsx`.
const PRIVATE_ROUTES = [
  // The jobs and Slack's round: route handlers, every one of them. `src/app/auth` was here until
  // issue #210 and is not a directory any more -- the check below is loud about a stale entry, and
  // this is the entry it was loud about.
  "src/app/api",
  "src/app/slack",
  // The pages of the installed app: they read a database and write to it, which is the one thing a
  // site made of files cannot do. `/account` and `/login` left with the login (issue #210).
  "src/app/[locale]/settings",
  "src/app/[locale]/dashboard",
  "src/app/[locale]/technologies/(catalog)",
  // The page that exists to be thrown from, for the E2E of the error boundary.
  "src/app/[locale]/test",
  // There is no proxy in front of a file. The language is in the path since #131, so what it did
  // for the public pages is now done by the addresses themselves; the redirect it performed from
  // `/en/...` is declared in `vercel.json` instead.
  "src/proxy.ts",
];

async function copyTree(): Promise<void> {
  // Everything in the working copy goes, **except** the build cache: a showcase build with a cold
  // Turbopack cache spends three minutes compiling a tree that has not changed. `node_modules` is
  // the junction and is left where it is.
  await mkdir(WORK, { recursive: true });
  for (const entry of await readdir(WORK, { withFileTypes: true })) {
    if (entry.name === ".next" || entry.name === "node_modules") continue;
    await rm(path.join(WORK, entry.name), { recursive: true, force: true });
  }
  for (const entry of await readdir(ROOT, { withFileTypes: true })) {
    if (SKIPPED.has(entry.name)) continue;
    await cp(path.join(ROOT, entry.name), path.join(WORK, entry.name), { recursive: true });
  }
  // A junction and not a copy: `node_modules` is the one directory in a Next project that would
  // make this script take minutes instead of seconds. On Windows a junction needs no privilege,
  // which a symbolic link to a directory does.
  if (!existsSync(path.join(WORK, "node_modules")))
    await symlink(path.join(ROOT, "node_modules"), path.join(WORK, "node_modules"), "junction");
}

async function prune(): Promise<void> {
  for (const route of PRIVATE_ROUTES) {
    const target = path.join(WORK, route);
    // Loud on purpose: a path that moved and is silently not found here is a Server Action back in
    // the tree, and the failure it causes is a build error pages away from its cause.
    if (!existsSync(target)) throw new Error(`Nothing at ${route}: the list in build-static.mts is stale.`);
    await rm(target, { recursive: true, force: true });
  }
}

// The default language carries no prefix: `/technologies/vite` is the English page and the address
// that is indexed (ADR 0008). The export writes it under `en/`, because every route lives under
// `app/[locale]`, so the English documents are lifted to the root and `/en/...` is left to the
// permanent redirect `vercel.json` declares.
async function liftDefaultLocale(exported: string): Promise<void> {
  const en = path.join(exported, "en");
  if (!existsSync(en)) throw new Error("No `en` directory in the export: the locale segment changed.");
  for (const entry of await readdir(en, { withFileTypes: true })) {
    await rename(path.join(en, entry.name), path.join(exported, entry.name));
  }
  await rm(en, { recursive: true, force: true });
  // The landing itself: the page at `/[locale]` is written beside the directory, not inside it.
  for (const ext of ["html", "txt"]) {
    const page = path.join(exported, `en.${ext}`);
    if (existsSync(page)) await rename(page, path.join(exported, `index.${ext}`));
  }
}

// The document a static host serves for every address it has no file for. Next writes one of its
// own, which is the bare 404 with no shell and no theme; what goes in its place is the app's, which
// the catch-all route exported at a reserved address (`src/app/[locale]/[...rest]/page.tsx`).
async function installNotFound(exported: string): Promise<void> {
  const written = path.join(exported, `${STATIC_NOT_FOUND_SEGMENT}.html`);
  if (!existsSync(written))
    throw new Error(`No ${STATIC_NOT_FOUND_SEGMENT}.html in the export: the catch-all route changed.`);
  await rm(path.join(exported, "404.html"), { force: true });
  await rename(written, path.join(exported, "404.html"));
  // The same document in the other four languages, which no host will ever ask for: one 404 is
  // served for the whole site and it is the English one, chosen before anything knows what the
  // reader was looking for.
  for (const locale of LOCALES) {
    const directory = locale === DEFAULT_LOCALE ? exported : path.join(exported, locale);
    for (const name of [`${STATIC_NOT_FOUND_SEGMENT}.html`, `${STATIC_NOT_FOUND_SEGMENT}.txt`, STATIC_NOT_FOUND_SEGMENT])
      await rm(path.join(directory, name), { recursive: true, force: true });
  }
}

// The acceptance criterion of #215, checked by the build that claims it: every address the sitemap
// declares has a document in the export. The sitemap is built from the same `localePath` the
// canonical of each page is built from, so what this compares is the addresses the site publishes
// against the files it ships -- and it runs **after** the English pages are lifted, which is the
// step that could silently leave `/faq` at `/en/faq`.
async function checkAgainstSitemap(exported: string): Promise<void> {
  const xml = await readFile(path.join(exported, "sitemap.xml"), "utf8");
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  const missing = paths.filter((address) => {
    const bare = address === "/" ? "index" : address.replace(/^\//, "");
    return !existsSync(path.join(exported, `${bare}.html`)) && !existsSync(path.join(exported, bare, "index.html"));
  });
  if (missing.length > 0) {
    console.error(`\n${missing.length} addresses in the sitemap have no document:`);
    console.error(missing.slice(0, 20).map((address) => `  ${address}`).join("\n"));
    process.exit(1);
  }
  console.log(`${paths.length} addresses in the sitemap, every one of them a file.`);
}

function build(): void {
  const result = spawnSync("pnpm", ["exec", "next", "build"], {
    cwd: WORK,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NEXT_PUBLIC_STATIC_SITE: "1" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Copying the source to .static-build ...");
await copyTree();
await prune();
build();
const exported = path.join(WORK, "out");
await liftDefaultLocale(exported);
await installNotFound(exported);
await checkAgainstSitemap(exported);
await rm(OUT, { recursive: true, force: true });
await rename(exported, OUT);
console.log(`\nThe showcase is in ${path.relative(ROOT, OUT)}/`);
