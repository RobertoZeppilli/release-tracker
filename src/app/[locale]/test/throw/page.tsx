import { notFound } from "next/navigation";
import { serverEnv } from "@/env/server";

// The only way a test can reach the error page: a page that fails on purpose. Like
// `/api/test/session` it exists only when E2E_AUTH_SECRET is set, so in production this address
// answers with the 404 of a route that was never written. `force-dynamic` keeps the build from
// rendering it, where the throw would be a build failure instead of an error page.
export const dynamic = "force-dynamic";

export default function ThrowPage(): never {
  if (!serverEnv.E2E_AUTH_SECRET) notFound();
  throw new Error("e2e: the deliberate failure behind the error page");
}
