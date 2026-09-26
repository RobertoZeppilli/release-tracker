import { redirect } from "next/navigation";
import { createRequestClient } from "@/lib/supabase-request";
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
