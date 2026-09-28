import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Creates the Developer that "Continue as local developer" signs in as on /login, or resets their
// password to the one in `.env.local`. Local only: GitHub OAuth needs an app of its own for the
// local Supabase, and the end-to-end tests never go through the real consent either.
const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
  DEV_LOGIN_EMAIL: z.email(),
  DEV_LOGIN_PASSWORD: z.string().min(1),
});

const env = EnvSchema.parse(process.env);
const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  throw new Error(`Refusing to touch ${host}: this script is for the local Supabase only.`);
}

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) throw error;
const existing = data.users.find((user) => user.email === env.DEV_LOGIN_EMAIL);

if (existing) {
  const { error: reset } = await db.auth.admin.updateUserById(existing.id, {
    password: env.DEV_LOGIN_PASSWORD,
  });
  if (reset) throw reset;
  console.log(`Password reset for ${env.DEV_LOGIN_EMAIL}.`);
} else {
  const { error: created } = await db.auth.admin.createUser({
    email: env.DEV_LOGIN_EMAIL,
    password: env.DEV_LOGIN_PASSWORD,
    email_confirm: true,
  });
  if (created) throw created;
  console.log(`Created ${env.DEV_LOGIN_EMAIL} with the free Plan the sign-up trigger gives.`);
}

console.log('Sign in at http://localhost:3000/login with "Continue as local developer".');
