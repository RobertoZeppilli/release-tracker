import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import { createRequestClient } from "@/lib/supabase-request";
import { safeRedirectPath } from "@/modules/auth";

// GitHub OAuth with the smallest scopes there are: the public profile and the email address.
// Reading repositories is a separate consent, asked for by the scanner, not by the login.
const SCOPES = "read:user user:email";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const form = await request.formData();
  const raw = form.get("next");
  const next = safeRedirectPath(typeof raw === "string" ? raw : null);

  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: SCOPES,
      // The site URL, not the request host: Supabase accepts only the URLs on its allow list.
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=provider", request.nextUrl.origin), 303);
  }
  return NextResponse.redirect(data.url, 303);
}
