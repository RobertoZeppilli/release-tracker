import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase-request";
import { DEFAULT_LOCALE, localePath, localeSchema } from "@/modules/i18n";
import { authorizeUrl, buildState } from "@/modules/notifications";
import { slackOauthCredentials, slackRedirectUri, slackStateSigner } from "@/modules/notifications/server";

// The first half of "Add to Slack" (#188): it sends the Developer to Slack's consent screen, where
// the channel is picked. Outside `[locale]` like the login routes, because it is a redirect and not
// a page; the language travels in the `state` instead, so the return lands where the Developer left.
//
// GET and not POST although it is a button: it writes nothing. What binds the round to this
// Developer is the signed `state`, read back in the callback, and not the method.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const parsed = localeSchema.safeParse(request.nextUrl.searchParams.get("locale"));
  const locale = parsed.success ? parsed.data : DEFAULT_LOCALE;
  const settings = localePath(locale, "/settings");

  const credentials = slackOauthCredentials();
  // No credentials is development, where the round cannot run: the button is not drawn either, so
  // this is the answer to a URL typed by hand, and `/settings` still has the manual field.
  if (!credentials) return NextResponse.redirect(new URL(`${settings}?slack=unavailable`, request.nextUrl.origin));

  const { data, error } = await (await createRequestClient()).auth.getUser();
  if (error || !data.user) return NextResponse.redirect(new URL("/login?next=/settings", request.nextUrl.origin));

  const state = buildState(
    { userId: data.user.id, locale, now: new Date() },
    slackStateSigner(credentials.clientSecret),
  );
  return NextResponse.redirect(
    authorizeUrl({ clientId: credentials.clientId, redirectUri: slackRedirectUri(), state }),
  );
}
