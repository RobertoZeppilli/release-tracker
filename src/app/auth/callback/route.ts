import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase-request";
import { safeRedirectPath } from "@/modules/auth";

// GitHub sends the Developer back here with a code; exchanging it writes the session cookies.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=denied", request.nextUrl.origin));

  const supabase = await createRequestClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=exchange", request.nextUrl.origin));

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
