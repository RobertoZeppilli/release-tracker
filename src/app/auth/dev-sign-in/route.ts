import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/env/server";
import { createRequestClient } from "@/lib/supabase-request";
import { safeRedirectPath } from "@/modules/auth";

// The way in during local development, where GitHub cannot be used: the local Supabase would need a
// second OAuth App of its own, with its own callback. The route exists only while both DEV_LOGIN_
// variables are set, which is never in production, where it answers the same 404 as a route that was
// never written. The password never reaches the browser: the form posts nothing but `next`.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { DEV_LOGIN_EMAIL: email, DEV_LOGIN_PASSWORD: password } = serverEnv;
  if (!email || !password) return new NextResponse("Not found", { status: 404 });

  const form = await request.formData();
  const raw = form.get("next");
  const next = safeRedirectPath(typeof raw === "string" ? raw : null);

  const supabase = await createRequestClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const back = `/login?error=dev&next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(new URL(back, request.nextUrl.origin), 303);
  }
  return NextResponse.redirect(new URL(next, request.nextUrl.origin), 303);
}
