import { serverEnv } from "@/env/server";
import { isAuthorizedJob } from "@/lib/job-auth";
import { createServiceClient } from "@/lib/supabase-server";
import { createSourceAdapters, detectReleases } from "@/modules/detection/server";
import { revalidateReleasePages } from "@/modules/releases/server";

// The daily Detection (ADR 0003), the first of the three crons in `vercel.json`. It never calls the
// AI: it leaves the new Releases `pending` and the Summary jobs take them from there.
// GET because Vercel Cron calls with GET.
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorizedJob(request, serverEnv.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const adapters = createSourceAdapters({ githubToken: serverEnv.GITHUB_TOKEN });
  const { detected, ...report } = await detectReleases(createServiceClient(), adapters);
  // A new Release changes the Technology page and gives the Release page its own address.
  return Response.json({ ...report, detected, revalidated: revalidateReleasePages(detected) });
}
