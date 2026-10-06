import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

// Technologies with nothing in them, only there to fill the Free limit: the picker shows a row for
// each, and a name of their own keeps them out of the way of a filter looking for another fixture.
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

// A follow written from outside the browser: what another session of the same Developer would do.
export async function addFollows(userId: string, technologyIds: readonly string[]): Promise<void> {
  const rows = technologyIds.map((technology_id) => ({ user_id: userId, technology_id }));
  const { error } = await serviceClient().from("follows").insert(rows);
  if (error) throw error;
}

// A Version in use declared from outside the browser. The trigger still runs under the service role,
// so the day of the declaration is written the same way a Developer's own press would write it.
export async function declareCurrentVersion(
  userId: string,
  technologyId: string,
  version: string,
): Promise<void> {
  const { error } = await serviceClient()
    .from("follows")
    .update({ current_version: version })
    .eq("user_id", userId)
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

export type FixtureDeveloper = {
  id: string;
  email: string;
  password: string;
  clearFollows: () => Promise<void>;
  remove: () => Promise<void>;
};

// The end-to-end tests never go through GitHub: Playwright cannot drive the OAuth consent. A test
// Developer signs in with a password through /api/test/session, the route guarded by E2E_AUTH_SECRET.
export async function seedDeveloper(): Promise<FixtureDeveloper> {
  const db = serviceClient();
  const email = `e2e-${randomUUID().slice(0, 8)}@example.test`;
  const password = randomUUID();
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const id = data.user.id;

  return {
    id,
    email,
    password,
    // Follows outlive a test: a suite that shares one Developer starts each test from none.
    clearFollows: async () => {
      const { error: cleared } = await db.from("follows").delete().eq("user_id", id);
      if (cleared) throw cleared;
    },
    remove: async () => {
      const { error: removed } = await db.auth.admin.deleteUser(id);
      if (removed) throw removed;
    },
  };
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
