import { z } from "zod";
import { serverEnv } from "@/env/server";
import { createRequestClient } from "@/lib/supabase-request";

// Signs a test Developer in without going through GitHub, because Playwright cannot drive the real
// OAuth consent. The route exists only when E2E_AUTH_SECRET is set: unset in production, where
// every request gets the same 404 as a route that was never written.
const BodySchema = z.object({
  secret: z.string().min(32),
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const secret = serverEnv.E2E_AUTH_SECRET;
  if (!secret) return new Response("Not found", { status: 404 });

  const body = BodySchema.safeParse(await request.json());
  if (!body.success) return Response.json({ error: "invalid body" }, { status: 400 });
  if (body.data.secret !== secret) return new Response("Not found", { status: 404 });

  const supabase = await createRequestClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });
  if (error) return Response.json({ error: error.message }, { status: 401 });
  return new Response(null, { status: 204 });
}
