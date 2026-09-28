import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { requireDeveloper } from "@/modules/auth/server";
import { buildDashboard } from "@/modules/dashboard";
import { readDashboard } from "@/modules/dashboard/server";
import { DashboardSummary, EmptyDashboard, Spotlight } from "@/modules/dashboard/ui";
import { listPickerTechnologies, readFollows } from "@/modules/plans/server";
import { FollowQuota, FollowsProvider } from "@/modules/plans/ui";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

// Behind the login, so dynamic anyway: the window is read on the server and the page arrives whole.
// The header lives inside the provider because the quota in the top bar is the same live count the
// page shows, and the two must never disagree.
export default async function DashboardPage() {
  const developer = await requireDeveloper("/dashboard");
  const db = await createRequestClient();
  const [{ followed, releases }, follows] = await Promise.all([readDashboard(db), readFollows(db)]);
  const dashboard = buildDashboard(followed, releases, new Date());

  return (
    <FollowsProvider developerId={developer.id} follows={follows}>
      <SiteHeader nav="dashboard" quota={<FollowQuota />} />
      <main id="content" className="mx-auto max-w-content px-4 pt-6 pb-8 sm:px-5">
        <h1 className="sr-only">Dashboard</h1>
        {followed.length === 0 ? <EmptyState db={db} /> : <FollowedStack dashboard={dashboard} />}
      </main>
    </FollowsProvider>
  );
}

function FollowedStack({ dashboard }: { dashboard: ReturnType<typeof buildDashboard> }) {
  return (
    <>
      <DashboardSummary verdict={dashboard.verdict} counts={dashboard.counts} />
      <Spotlight entries={dashboard.spotlight} />
    </>
  );
}

const SHORTLIST = 8;

// Only the empty state needs the Catalog, so nothing else pays for the query.
async function EmptyState({ db }: { db: Awaited<ReturnType<typeof createRequestClient>> }) {
  const technologies = (await listPickerTechnologies(db))
    .filter((technology) => !technology.retired)
    .sort((a, b) => a.name.localeCompare(b.name));

  return <EmptyDashboard shortlist={technologies.slice(0, SHORTLIST)} total={technologies.length} />;
}
