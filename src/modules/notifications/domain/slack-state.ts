import { z } from "zod";
import { type Locale, localeSchema } from "@/modules/i18n";

// The `state` of the OAuth round (#188). Slack says that a `state` which does not come back
// unchanged means the authorisation must be treated as a forgery, so this is not a random string
// kept in a cookie: it is signed, it names the Developer it was made for, and it expires.
//
// Three things travel in it, and nothing secret does:
//   - the Developer, so the webhook that comes back is written to the row of whoever started the
//     round and never to the row of whoever happens to be signed in at the return;
//   - the locale, so the return lands on `/settings` in the language the Developer left;
//   - the moment it was made, so a link kept in a browser's history is worth nothing tomorrow.
//
// The signature is injected rather than computed here: `domain` stays pure TypeScript and the HMAC
// lives in `server/slack-oauth.ts`, which is also the only place the key exists.
export type Signer = (payload: string) => string;

// Ten minutes, the life of the `code` Slack hands back: a round that takes longer than its own code
// has nothing left to exchange.
export const STATE_TTL_MS = 10 * 60 * 1000;

const PayloadSchema = z.object({
  u: z.uuid(),
  l: localeSchema,
  // Milliseconds, as `Date.now()` gives them.
  t: z.number().int().positive(),
});

// base64url by hand over `btoa`, which is a web standard and so leaves this file pure (ADR 0006),
// unlike `Buffer`. The payload is ASCII by construction: a uuid, a locale and a number.
function encode(payload: unknown): string {
  return btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(payload: string): unknown {
  return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
}

export function buildState(
  { userId, locale, now }: { userId: string; locale: Locale; now: Date },
  sign: Signer,
): string {
  const payload = encode({ u: userId, l: locale, t: now.getTime() } satisfies z.infer<typeof PayloadSchema>);
  return `${payload}.${sign(payload)}`;
}

// Null is the only answer a caller gets for a `state` that is wrong, whatever is wrong with it: a
// route that could tell a bad signature from an expired one would be telling it to whoever is
// trying. The caller answers the same way to all of them.
export function readState(raw: string, sign: Signer, now: Date): { userId: string; locale: Locale } | null {
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  if (!equalsInConstantTime(raw.slice(dot + 1), sign(payload))) return null;

  let decoded: unknown;
  try {
    decoded = decode(payload);
  } catch {
    return null;
  }
  const parsed = PayloadSchema.safeParse(decoded);
  if (!parsed.success) return null;

  const age = now.getTime() - parsed.data.t;
  // A `state` from the future is as wrong as one too old: both mean the payload was not made here.
  if (age < 0 || age > STATE_TTL_MS) return null;
  return { userId: parsed.data.u, locale: parsed.data.l };
}

// A comparison whose duration says nothing about how much of the signature was right. `timingSafeEqual`
// would do it in one call, but it is Node's and this file is pure TypeScript by rule (ADR 0006).
function equalsInConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
