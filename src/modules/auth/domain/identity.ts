import { z } from "zod";

// What GitHub hands Supabase about the person signing in. Everything in it is optional: the account
// may have no picture, and a Developer seeded by a test has no GitHub behind it at all, so every
// reader is written to stand without either.
const IdentitySchema = z
  .object({
    avatar_url: z.string().url(),
    user_name: z.string().min(1),
    preferred_username: z.string().min(1),
  })
  .partial();

export type Identity = { handle: string | null; avatarUrl: string | null };

// One reader for the two sides: the account menu asks the browser for this and the account page asks
// the server, and what they say about the same Developer has to be the same thing.
export function identityFrom(metadata: unknown): Identity {
  const identity = IdentitySchema.safeParse(metadata);
  const fields = identity.success ? identity.data : {};
  return {
    handle: fields.user_name ?? fields.preferred_username ?? null,
    avatarUrl: fields.avatar_url ?? null,
  };
}
