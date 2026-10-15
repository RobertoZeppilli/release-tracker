import { redirect } from "next/navigation";
import { createRequestClient } from "@/lib/supabase-request";
import { identityFrom, type Identity } from "../domain/identity";
import { loginPath } from "../domain/redirect";

// Only the identity: name, avatar and Plan belong to the pages that need them.
export type Developer = { id: string; email: string | null };

// `getUser` revalidates the token with Supabase; the cookie alone is not proof of a session.
export async function getDeveloper(): Promise<Developer | null> {
  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

// The authority for a protected page: the proxy only redirects early, it does not authorize.
export async function requireDeveloper(pathname: string): Promise<Developer> {
  const developer = await getDeveloper();
  if (!developer) redirect(loginPath(pathname));
  return developer;
}

// Everything the account page says about the Developer reading it, which is more than the identity
// every other page needs: the handle and the picture come with the GitHub sign-in and are kept with
// the account, so a page that lists what is held has to list them too. Read on the server here and
// in the browser in the account menu, through the same reader (`identityFrom`).
export type Account = Developer & Identity;

export async function getAccount(): Promise<Account | null> {
  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    ...identityFrom(data.user.user_metadata),
  };
}

// The same authority as `requireDeveloper`, for the one page that needs the whole account.
export async function requireAccount(pathname: string): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect(loginPath(pathname));
  return account;
}
