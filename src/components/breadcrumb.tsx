import type { Translator } from "@/modules/i18n";
import { getTranslator } from "@/modules/i18n/server";
import { LocaleLink as Link } from "@/modules/i18n/ui";

export type PathItem = string | { label: string; href: string };

// The first step of every breadcrumb. `/technologies` sits behind sign-in, and the step is a link
// all the same: the breadcrumb says where the page sits, not what the viewer may open, and
// `requireDeveloper` brings a visitor back here once signed in.
// It takes `t` instead of holding a key, so the breadcrumb itself stays what it was: the other steps
// are slugs and versions, which are names and are never translated, and a component that translated
// some of its items and not others would have to be told which (ADR 0008).
export function technologiesCrumb(t: Translator): { label: string; href: string } {
  return { label: t("shell.nav.technologies"), href: "/technologies" };
}

// Where the page sits, at the top of the page it describes. It used to share the top bar's slot with
// the two sections, and the slot is one: on a public page the breadcrumb won and the Dashboard was
// left inside the account panel, a click away from being seen at all (issue #119). The bar says
// where the viewer may go; this says where they are, and it belongs to the content.
export async function PageBreadcrumb({ path }: { path: readonly PathItem[] }) {
  const t = await getTranslator();

  return (
    <nav aria-label={t("shell.breadcrumb")} className="mb-5">
      <ol className="flex flex-wrap gap-2 font-mono text-label text-text-muted">
        {path.map((item, index) => {
          const current = index === path.length - 1;
          const label = typeof item === "string" ? item : item.label;
          return (
            <li key={label} className="flex gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {typeof item === "string" ? (
                <span aria-current={current ? "page" : undefined} className={current ? "text-text" : undefined}>
                  {item}
                </span>
              ) : (
                <Link href={item.href} className="no-underline hover:text-text">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
