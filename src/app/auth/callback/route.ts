import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase-request";
import { createServiceClient } from "@/lib/supabase-server";
import { safeRedirectPath } from "@/modules/auth";
import { bornNow, doorClosed } from "@/modules/waitlist";

// GitHub sends the Developer back here with a code; exchanging it writes the session cookies.
//
// ⚠️ This is also the door of the Waitlist (ADR 0010): until the launch no **new** account is born,
// and this is the only place that can tell a new one from an old one. GitHub is one provider for
// signing in and for signing up, so there is no `signup` route to switch off, and switching off
// `/login` would shut out the Developers who already have an account.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=denied", request.nextUrl.origin));

  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=exchange", request.nextUrl.origin));

  // The exchange has already inserted the row, and the trigger on `auth.users` has already given it
  // a Free Plan: an account born a moment ago is the account this exchange created, so it is taken
  // away again, cookies included. `follows` and `plans` reference `auth.users (id) on delete
  // cascade`, so there is nothing left behind, exactly as in `/auth/delete-account`.
  // A Developer who already had an account is older than the window and never reaches this branch.
  if (data.user && doorClosed(new Date()) && bornNow(data.user.created_at, new Date())) {
    await createServiceClient().auth.admin.deleteUser(data.user.id);
    // ⚠️ The sign out happens whether the deletion worked or not, and the reader is told the same
    // thing either way: a session for an account that should not exist is the one state to avoid,
    // and a row left behind is an empty Free Plan nobody is signed into.
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?closed=1", request.nextUrl.origin));
  }

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
