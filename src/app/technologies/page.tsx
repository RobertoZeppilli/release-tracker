import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { requireDeveloper } from "@/modules/auth/server";
import { splitPicker } from "@/modules/plans";
import { listPickerTechnologies, readFollows } from "@/modules/plans/server";
import { FollowQuota, FollowsProvider, TechnologyPicker } from "@/modules/plans/ui";

export const metadata: Metadata = { title: "Technologies", robots: { index: false } };

// The page is behind the login, so it is dynamic anyway: the sections are split on the server and
// arrive already right, and the browser only writes follows from there on.
export default async function TechnologiesPage() {
  const developer = await requireDeveloper("/technologies");
  const db = await createRequestClient();
  const [technologies, follows] = await Promise.all([listPickerTechnologies(db), readFollows(db)]);
  const sections = splitPicker(technologies, follows.map(({ technologyId }) => technologyId));

  return (
    <FollowsProvider developerId={developer.id} follows={follows}>
      <SiteHeader section="technologies" quota={<FollowQuota />} />
      <main id="content" className="mx-auto max-w-content px-4 pt-6 pb-8 sm:px-5">
        <h1 className="sr-only">Technologies</h1>
        <TechnologyPicker sections={sections} />
      </main>
    </FollowsProvider>
  );
}
