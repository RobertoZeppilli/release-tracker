import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serverEnv } from "@/env/server";

// Drops the cached render of one route, because an end-to-end test that writes to a Technology and
// then reads its page would otherwise be handed the page from before the write: the Technology page
// is `revalidate = 3600`, so the first render of a slug is served for an hour and a row written
// after it never reaches the page (issue #178). The route exists only when E2E_AUTH_SECRET is set:
// unset in production, where every request gets the same 404 as a route that was never written.
//
// `route` is the pattern, not one path (`/[locale]/technologies/[slug]`), so one call reaches every
// slug in every one of the five languages: a test knows which page it changed, not which of the
// five renders of it a prefetch happened to warm.
const BodySchema = z.object({
  secret: z.string().min(32),
  route: z.string().startsWith("/"),
});

export async function POST(request: Request): Promise<Response> {
  const secret = serverEnv.E2E_AUTH_SECRET;
  if (!secret) return new Response("Not found", { status: 404 });

  const body = BodySchema.safeParse(await request.json());
  if (!body.success) return Response.json({ error: "invalid body" }, { status: 400 });
  if (body.data.secret !== secret) return new Response("Not found", { status: 404 });

  revalidatePath(body.data.route, "page");
  return new Response(null, { status: 204 });
}
