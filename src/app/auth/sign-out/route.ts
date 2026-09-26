import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase-request";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRequestClient();
  await supabase.auth.signOut();
  // The origin that served the request, so a preview deployment stays on itself.
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), 303);
}
