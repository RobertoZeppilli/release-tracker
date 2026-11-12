import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Category } from "@/modules/catalog";
import type { SummaryContent } from "@/modules/summaries";

const LocalSupabaseSchema = z.object({ API_URL: z.url(), SECRET_KEY: z.string().min(1) });
const IdRowSchema = z.object({ id: z.uuid() });

// The app reads the same local stack; the fixtures are written with the service role. The client is
// kept for the whole worker: `supabase status` is a process, and several at once have been seen to
// trip over the CLI's own telemetry file.
let client: SupabaseClient | null = null;

// A worker starts over whenever Playwright changes its options, so the CLI is asked again and again
// across one run. On Windows it answers EPERM under that pressure, which has nothing to do with the
// test that happened to ask: waiting a moment and asking again is the whole remedy. The wait is
// synchronous because every caller of `serviceClient` expects an answer, not a promise.
function supabaseStatus(attempts = 3): string {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return execSync("pnpm exec supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      if (attempt >= attempts) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 500);
    }
  }
}

function serviceClient(): SupabaseClient {
  if (client) return client;
  const output = supabaseStatus();
  const { API_URL, SECRET_KEY } = LocalSupabaseSchema.parse(JSON.parse(output.slice(output.indexOf("{"))));
  client = createClient(API_URL, SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export type FixtureRelease = {
  version: string;
  significance: "featured" | "notable" | "digest" | "preview";
  origin: "imported" | "detected";
  status: "pending" | "processing" | "ready" | "unavailable" | "skipped" | "failed";
  notes: string | null;
  // The Dashboard looks back 30 days, so its tests need a Release dated near the run.
  publishedAt?: Date;
  // Only for a `ready` Summary: the verdict the Upgrade Path counts, with a generic content around it.
  actionRequired?: boolean;
  // Only for a `ready` Summary: stored as is, even if it does not validate.
  summary?: SummaryContent | Record<string, unknown>;
};

function contentFor(release: FixtureRelease): unknown {
  if (release.summary !== undefined) return release.summary;
  if (release.actionRequired === undefined) return null;
  return {
    title: `Fixture ${release.version} release.`,
    keyPoints: [{ text: "A first change." }, { text: "A second change." }, { text: "A third change." }],
    breakingChanges: release.actionRequired ? [{ change: "The default export is gone", migration: "Use the named export." }] : [],
    actionRequired: release.actionRequired,
  };
}

export type FixtureTechnology = {
  id: string;
  slug: string;
  name: string;
  repo: string;
  remove: () => Promise<void>;
};

// A Technology of its own for each run, so pages cached by earlier runs never interfere.
export async function seedTechnology(
  releases: FixtureRelease[],
  // Every Technology has a Category, and the picker groups the Catalog by it: a fixture declares its
  // own so a test can say which group its row belongs to.
  { retired = false, category = "library" }: { retired?: boolean; category?: Category } = {},
): Promise<FixtureTechnology> {
  const db = serviceClient();
  const slug = `e2e-${randomUUID().slice(0, 8)}`;
  const name = `Fixture ${slug.slice(4)}`;
  const repo = `fixture/${slug}`;

  const technology = await db
    .from("technologies")
    .insert({ slug, name, category, classification_strategy: "semver", retired })
    .select("id")
    .single();
  if (technology.error) throw technology.error;
  const technologyId = IdRowSchema.parse(technology.data).id;

  const sources = await db.from("sources").insert([
    { technology_id: technologyId, role: "detection", kind: "npm", config: { package: slug } },
    { technology_id: technologyId, role: "notes", kind: "github-releases", config: { repo, tagFormat: "v{version}" } },
  ]);
  if (sources.error) throw sources.error;

  for (const [index, release] of releases.entries()) {
    const inserted = await db
      .from("releases")
      .insert({
        technology_id: technologyId,
        version: release.version,
        significance: release.significance,
        origin: release.origin,
        published_at: (release.publishedAt ?? new Date(Date.UTC(2026, 0, 10 + index))).toISOString(),
      })
      .select("id")
      .single();
    if (inserted.error) throw inserted.error;
    const releaseId = IdRowSchema.parse(inserted.data).id;
    if (release.notes !== null) {
      const url = `https://github.com/${repo}/releases/tag/v${release.version}`;
      const notes = await db.from("release_notes").insert({ release_id: releaseId, body: release.notes, url });
      if (notes.error) throw notes.error;
    }
    const summary = await db.from("summaries").insert({
      release_id: releaseId,
      status: release.status,
      content: contentFor(release),
      model: release.status === "ready" ? "claude-opus-5" : null,
      prompt_version: release.status === "ready" ? "v1" : null,
    });
    if (summary.error) throw summary.error;
  }

  async function remove() {
    const ids = await db.from("releases").select("id").eq("technology_id", technologyId);
    if (ids.error) throw ids.error;
    const releaseIds = z.array(IdRowSchema).parse(ids.data).map((row) => row.id);
    for (const table of ["summaries", "release_notes"] as const) {
      const { error } = await db.from(table).delete().in("release_id", releaseIds);
      if (error) throw error;
    }
    for (const [table, column] of [
      // A follow holds the Technology by a foreign key, so it goes first: a test that pressed the
      // Toggle can have left one behind, and the delete below would be refused with
      // `follows_technology_id_fkey`.
      ["follows", "technology_id"],
      ["releases", "technology_id"],
      ["sources", "technology_id"],
      ["technologies", "id"],
    ] as const) {
      const { error } = await db.from(table).delete().eq(column, technologyId);
      if (error) throw error;
    }
  }

  return { id: technologyId, slug, name, repo, remove };
}

export type FixtureFillers = { ids: string[]; remove: () => Promise<void> };

// Technologies with nothing in them, only there to give the Catalog rows to press: the picker shows
// a row for each, and a name of their own keeps them out of the way of a filter looking for another
// fixture.
export async function seedFillers(count: number): Promise<FixtureFillers> {
  const db = serviceClient();
  const rows = Array.from({ length: count }, () => {
    const slug = `filler-${randomUUID().slice(0, 8)}`;
    // A Category of their own, so the fillers never crowd the group a test is looking at.
    return { slug, name: `Filler ${slug.slice(7)}`, category: "platform" as const, classification_strategy: "semver" as const };
  });

  const inserted = await db.from("technologies").insert(rows).select("id");
  if (inserted.error) throw inserted.error;
  const ids = z.array(IdRowSchema).parse(inserted.data).map((row) => row.id);

  return {
    ids,
    remove: async () => {
      for (const [table, column] of [
        ["follows", "technology_id"],
        ["technologies", "id"],
      ] as const) {
        const { error } = await db.from(table).delete().in(column, ids);
        if (error) throw error;
      }
    },
  };
}

// The Follow Toggle answers before the database does, and says so with `aria-busy` while the write is
// on its way (`follows-provider.tsx`). A test that then asks the server what it holds, with a reload
// or with a declaration written on the follow, waits for that to go: the button has already changed
// its mind, the row has not. The toggle to pass is the one the press leaves behind, so waiting for it
// also waits for the optimistic answer.
export async function followWritten(toggle: Locator): Promise<void> {
  await expect(toggle).not.toHaveAttribute("aria-busy", "true");
}

// A follow written from outside the browser: what a second tab would leave behind.
export async function addFollows(technologyIds: readonly string[]): Promise<void> {
  const rows = technologyIds.map((technology_id) => ({ technology_id }));
  const { error } = await serviceClient().from("follows").insert(rows);
  if (error) throw error;
}

// ⚠️ **One table for the whole suite.** Since issue #210 a follow belongs to the installed copy and
// not to an account, so there is no Developer of its own to isolate a test any more: a test that
// writes follows clears them, or it hands the next one its leftovers.
export async function clearFollows(): Promise<void> {
  const { error } = await serviceClient().from("follows").delete().not("technology_id", "is", null);
  if (error) throw error;
}

// A Version in use declared from outside the browser. The trigger still runs under the service role,
// so the day of the declaration is written the same way a Developer's own press would write it.
export async function declareCurrentVersion(technologyId: string, version: string): Promise<void> {
  const { error } = await serviceClient()
    .from("follows")
    .update({ current_version: version })
    .eq("technology_id", technologyId);
  if (error) throw error;
}

// A Technology leaves the Catalog while it is followed: the only way a retired follow can exist.
export async function retireTechnology(technologyId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("technologies")
    .update({ retired: true })
    .eq("id", technologyId);
  if (error) throw error;
}

// The app reads the secret from .env.local, which the Playwright process does not load.
export function e2eAuthSecret(): string {
  const fromEnv = process.env.E2E_AUTH_SECRET;
  if (fromEnv) return fromEnv;
  // Playwright runs from the repository root.
  const file = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of file.split("\n")) {
    const [name, ...rest] = line.trim().split("=");
    if (name === "E2E_AUTH_SECRET" && rest.length > 0) return rest.join("=");
  }
  throw new Error("E2E_AUTH_SECRET is not set: add it to .env.local (see .env.example).");
}

// ⚠️ **The page has arrived, as opposed to the wait for it.** `/dashboard` and `/technologies` sit
// behind a loading boundary, so the framework streams the wait first and the page after it, and for
// a moment the document holds **both**: the skeleton, visible, and the real page, hidden, waiting to
// be swapped in. `page.goto` resolves on `load`, which is inside that moment, so a test that asserts
// on content is safe (the locator waits) while a test that **measures geometry** right after `goto`
// can measure the wait instead. That is what it did: against the production build, seven E2E read
// `locator("header")` as two elements and failed on `main` on 2026-10-15, deterministically, three
// attempts each. Call this between the navigation and the first measurement.
export async function arrived(page: Page): Promise<void> {
  await expect(page.locator('[data-waiting="page"]')).toHaveCount(0);
}

// ⚠️ **The page forgets its render.** `/technologies/[slug]` is `revalidate = false`, so the
// first render of a slug is served indefinitely: a test that writes to a Technology and then reads
// its page can be handed the page from before the write, byte for byte, with `x-nextjs-cache: HIT`.
// Measured in issue #178, where the test pressed a retired Technology that the page still offered a
// Follow for; inside the full suite a prefetch from the Catalog is enough to have warmed it, and
// alone nothing warms it, which is why the test passed 44 runs by itself. `route` is the pattern and
// not one path, so one call reaches every slug in every language.
export async function forgetRender(page: Page, route: string): Promise<void> {
  const response = await page.request.post("/api/test/revalidate", {
    data: { secret: e2eAuthSecret(), route },
  });
  expect(response.status(), "the test-only revalidation route answered").toBe(204);
}

// ⚠️ **The control answers, as opposed to being on the page.** A Follow Toggle is a
// `type="button"` with a handler and no form behind it, so until React has hydrated it a press does
// **nothing at all**, and it leaves no trace: the test goes on to wait for an effect that will never
// come and fails on the assertion after the click, five seconds later and somewhere else. That is
// issue #178, where `technology-follow.spec.ts` passed 44 runs alone and failed inside the full
// suite, and where throttling the CPU 20x reproduces it every time: `page.goto` resolves on `load`,
// which says the scripts arrived, never that they have run. React writes its own keys onto every
// element it hydrates, so whether this button is wired yet is a question the page can answer.
// Call this before the first press of a client control, not before an assertion: a locator that
// only reads waits by itself.
export async function wired(locator: Locator): Promise<void> {
  await expect(async () => {
    const hydrated = await locator.evaluate((node: Element) =>
      Object.keys(node).some((key) => key.startsWith("__react")),
    );
    expect(hydrated, "React has hydrated the control").toBe(true);
  }).toPass();
}

// ⚠️ **The box as layout has it, and of the element the document actually holds.** The
// Technology page replaces its whole tree once shortly after `load` (its `h1` is built twice, which
// an observer in the page counted), so the node a locator resolved a moment earlier can already be
// detached, and a detached element measures 0 in every direction:
// `boundingBox()` answers `null`, `getBoundingClientRect()` answers zeros, and the live element
// beside it has the right number all along. That is issue #178, where a mark 24px wide was read as
// `undefined` in 17 runs out of 20 against the production build. What is retried here is **which
// element is measured**, never the number it gives: the measurement itself is asserted once, by the
// test, against the threshold `DESIGN.md` sets.
export async function boxOf(locator: Locator): Promise<{ width: number; height: number; top: number; left: number }> {
  let box = { width: 0, height: 0, top: 0, left: 0 };

  await expect(async () => {
    const seen = await locator.evaluate((node: Element) => {
      const rect = node.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        connected: node.isConnected,
      };
    });
    expect(seen.connected, "the element measured is still the one on the page").toBe(true);
    box = { width: seen.width, height: seen.height, top: seen.top, left: seen.left };
  }).toPass();

  return box;
}

// Read with the service role: what the database holds, as opposed to what the page says about it.
export async function countFollows(): Promise<number> {
  const { count, error } = await serviceClient()
    .from("follows")
    .select("technology_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

// A Notification written from outside the browser, which is what the job does (issue #169). The
// bell's tests need rows without running the job: the job reads Releases, follows and preferences,
// and what the panel is about is none of those.
export async function addNotification(
  releaseId: string,
  event: "featured_release" | "notable_release" = "featured_release",
): Promise<void> {
  const { error } = await serviceClient().from("notifications").insert({ event, release_id: releaseId });
  if (error) throw error;
}

// Notifications outlive a test, like follows: a suite starts each test from none.
export async function clearNotifications(): Promise<void> {
  const { error } = await serviceClient().from("notifications").delete().not("id", "is", null);
  if (error) throw error;
}

// What the database holds, as opposed to what the bell says: the counter answers before the write
// lands, so the proof that a press was written is a read with the service role.
export async function countUnseen(): Promise<number> {
  const { count, error } = await serviceClient()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("seen_at", null);
  if (error) throw error;
  return count ?? 0;
}

// The Release a fixture's Version was given, which a Notification has to point at.
// The Notification settings, written and read with the service role: what `/settings` saved is
// proved against the database and not against the page that saved it (issue #171).
export async function clearNotificationSettings(): Promise<void> {
  const db = serviceClient();
  const settings = await db.from("notification_settings").delete().not("singleton", "is", null);
  if (settings.error) throw settings.error;
  const preferences = await db.from("notification_preferences").delete().not("event", "is", null);
  if (preferences.error) throw preferences.error;
  // The Slack webhook lives in a table of its own, which no client may touch (#172): without this
  // line a webhook saved by one test would still be there for the next one.
  const secrets = await db.from("notification_secrets").delete().not("singleton", "is", null);
  if (secrets.error) throw secrets.error;
}

const PreferenceRowSchema = z.object({ enabled: z.boolean() });

// Null when that pair was never saved, which is the declared starting point and not "off".
export async function savedPreference(event: string, channel: string): Promise<boolean | null> {
  const { data, error } = await serviceClient()
    .from("notification_preferences")
    .select("enabled")
    .eq("event", event)
    .eq("channel", channel)
    .maybeSingle();
  if (error) throw error;
  return data === null ? null : PreferenceRowSchema.parse(data).enabled;
}

const LocaleRowSchema = z.object({ preferred_locale: z.string() });

export async function savedLocale(): Promise<string | null> {
  const { data, error } = await serviceClient()
    .from("notification_settings")
    .select("preferred_locale")
    .maybeSingle();
  if (error) throw error;
  return data === null ? null : LocaleRowSchema.parse(data).preferred_locale;
}

export async function releaseIdFor(technologyId: string, version: string): Promise<string> {
  const { data, error } = await serviceClient()
    .from("releases")
    .select("id")
    .eq("technology_id", technologyId)
    .eq("version", version)
    .single();
  if (error) throw error;
  return IdRowSchema.parse(data).id;
}
