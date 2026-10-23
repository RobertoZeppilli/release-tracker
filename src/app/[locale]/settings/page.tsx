import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { createRequestClient } from "@/lib/supabase-request";
import { requireAccount } from "@/modules/auth/server";
import { getTranslator } from "@/modules/i18n/server";
import { LocalePicker } from "@/modules/i18n/ui";
import { trialOf } from "@/modules/notifications";
import { readNotificationSettings } from "@/modules/notifications/server";
import { NotificationSettings } from "@/modules/notifications/ui";

// Behind the login and never indexed, so the whole of its metadata is the title in the page's own
// language (ADR 0008). It reads `settings.title`, the key the heading below reads, and not a key of
// its own in `page`: the tab and the heading of this page are one word, and two keys holding it
// would be two places to translate it.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return { title: t("settings.title"), robots: { index: false } };
}

// What the reader changes about the app, as opposed to what the account *is*, which is `/account`.
// It is a page and not a row of the account panel because every preference after the language lands
// beside it here, while in the panel each one would make the panel taller; and the panel's height is
// the reason the foot had to be rebuilt in two columns (`LocalePicker`, the foot variant).
// ⚠️ Signed in only, like `/account`: the language itself is reachable from the foot of every public
// page, so a visitor sent here would find a page of preferences they have nowhere to keep.
export default async function SettingsPage() {
  await requireAccount("/settings");
  const t = await getTranslator();
  // Read here and handed down, so the section stays a component that is given what it draws. The
  // Developer's own client: RLS is what keeps the two rows theirs (`readNotificationSettings`).
  const settings = await readNotificationSettings(await createRequestClient());

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-content px-4 pt-5 pb-8 sm:px-5 sm:pt-6">
        <h1 className="font-sans text-headline font-semibold">{t("settings.title")}</h1>
        <p className="mt-3 max-w-prose font-sans text-body text-text-muted">{t("settings.intro")}</p>
        <section className="mt-6 max-w-measure border-t border-rule pt-4">
          <h2 className="font-mono text-label text-text">{t("shell.language")}</h2>
          <p className="mt-2 max-w-prose font-sans text-meta text-text-muted">
            {t("settings.language.note")}
          </p>
          <LocalePicker variant="page" />
        </section>
        <NotificationSettings
          preferences={settings.preferences}
          preferredLocale={settings.preferredLocale}
          trial={trialOf(settings.externalTrialStartedAt, new Date())}
          t={t}
        />
      </main>
    </>
  );
}
