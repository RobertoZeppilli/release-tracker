import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase-request";
import { createServiceClient } from "@/lib/supabase-server";
import { confirmsDeletion } from "@/modules/auth";

// The one write in this app that the browser cannot make: deleting a row of `auth.users` is a
// service-role call, and the service role never travels to a client (CLAUDE.md). So the deletion is
// a route handler, like the rest of `/auth`, and it answers to a form post.
//
// The order of the three steps is the whole of it. The session is read **first**, from the request
// cookies, so the id that gets deleted is the one the caller is signed in as and never one a form
// could name. The word is checked **on the server** as well as in the field, because a form can be
// posted without the page. Only then does the service role act, and `follows` and `plans` go with
// the user: both reference `auth.users (id) on delete cascade`, so there is nothing left to sweep.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  // Not signed in: there is no account to delete, and the login is where that is said.
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?next=%2Faccount", request.nextUrl.origin), 303);
  }

  const form = await request.formData();
  const typed = form.get("confirm");
  if (!confirmsDeletion(typeof typed === "string" ? typed : null)) {
    return NextResponse.redirect(new URL("/account?error=confirm", request.nextUrl.origin), 303);
  }

  const { error: deleted } = await createServiceClient().auth.admin.deleteUser(data.user.id);
  if (deleted) {
    return NextResponse.redirect(new URL("/account?error=failed", request.nextUrl.origin), 303);
  }

  // The account is gone, the cookies in this browser are not: without this the next request would
  // carry a token for a user who no longer exists, which reads as a broken session rather than as a
  // deletion that worked.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?deleted=1", request.nextUrl.origin), 303);
}
