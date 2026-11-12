import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { getTranslator } from "@/modules/i18n/server";
import { splitPicker } from "@/modules/follows";
import { listPickerTechnologies, readFollows } from "@/modules/follows/server";
import { FollowsProvider, TechnologiesPage } from "@/modules/follows/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("page.technologies.title"), robots: { index: false } };
}

// The split: two columns at 1240px, the Stack and the Catalog, and one question each (DESIGN.md,
// Technologies, the split). The 1041px step and not 1240: DESIGN.md says "at 1040px and below" the
// two columns become one, so the split starts one pixel above it.
const SPLIT =
  "grid max-w-content items-start gap-7 min-[1041px]:grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-[1041px]:gap-8";

// Dynamic: the columns are split on the server and arrive already right, and the browser only
// writes follows from there on.
//
// The top bar carries **no quota here**: its quota is a link to this page, and the panel at the head
// of the left column prints the same number 60px below it (DESIGN.md, Navigation).
export default async function TechnologiesRoute() {
  const t = await getTranslator();
  const db = await createRequestClient();
  const [technologies, follows] = await Promise.all([listPickerTechnologies(db), readFollows(db)]);
  const sections = splitPicker(
    technologies,
    follows.map(({ technologyId }) => technologyId),
  );

  return (
    <FollowsProvider follows={follows}>
      <SiteHeader section="technologies" />
      <main id="content" className={`mx-auto px-4 pt-5 pb-8 sm:px-5 sm:pt-6 ${SPLIT}`}>
        <h1 className="sr-only">{t("page.technologies.title")}</h1>
        <TechnologiesPage sections={sections} />
      </main>
      <BackToTop />
    </FollowsProvider>
  );
}
