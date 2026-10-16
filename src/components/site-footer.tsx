import { getTranslator } from "@/modules/i18n/server";
import { LocaleLink as Link, LocalePicker } from "@/modules/i18n/ui";
import { FOOT } from "./site-foot";

// The foot of every page of the app, rendered once by the root layout. It is the wordmark and two
// columns with titles, not the one labelled row the issue first sketched: five destinations on one
// line read as five equal things, and `terms` and `faq` are not the same kind of page. Mono 12px
// over a 1px `rule`, no surface, no shadow and no second container: it sits in the page's own
// container (DESIGN.md, Layout, "The bar's container is the page's container"), so the mark below
// opens under the same letter the mark in the bar opens under.
//
// ⚠️ **One grid of four columns**, and both halves of that are a fix (2026-10-16):
// 1. The tracks were a fixed 160px each, starting at the left, so above 1000px the foot huddled in
//    the first third of the page with half of it empty beside it. They are fractions now, so the
//    columns stand at the quarters of the page at every width.
// 2. The **language** is the fourth column again, a column like the other two: it had been folded
//    into two sub-columns to keep the foot short, and two columns that mean nothing read as a table
//    of nothing. Five names in a column make the foot **11px taller**, which was a Dashboard
//    regression until its standing column was clamped by its own grid area (`standing-column.tsx`);
//    `dashboard.spec.ts`, "the columns apart", holds that end of it.
// On a phone the mark takes a row of its own and the three groups sit under it, two side by side
// and the language across the width as a wrapping row (`LocalePicker`, the foot variant): the mark
// used to be a column of the grid, and `product` and `legal` were living on what was left of 390px.
// ⚠️ `mt-auto`, with the flex column on `body` in `globals.css`: on a short page (the 404, an error,
// a signed-out account) the content does not reach the bottom of the window, and a foot that
// followed it sat halfway up the screen with nothing under it.
export async function SiteFooter() {
  const t = await getTranslator();

  return (
    <footer className="mx-auto mt-auto max-w-content px-4 pb-7 sm:px-5">
      <div className="grid grid-cols-2 items-start gap-x-6 gap-y-6 border-t border-rule pt-5 font-mono text-meta sm:grid-cols-[auto_repeat(3,minmax(0,1fr))] sm:gap-x-8">
        {/* DESIGN.md, Brand Mark: the mark appears once more in the page foot, at Meta size. Same
            ink and same colon as in the bar, one step smaller, and the home link it already is. */}
        <Link
          href="/"
          className="col-span-2 tracking-[-0.02em] whitespace-nowrap text-text no-underline sm:col-span-1 sm:mr-6 [font-variant-ligatures:none]"
        >
          verdict:
        </Link>
        {FOOT.map((group) => (
          <nav key={group.title} aria-label={t(group.title)}>
            <h2 className="text-text-muted">{t(group.title)}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-faint no-underline hover:text-text">
                    {t(link.message)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 sm:col-span-1">
          <LocalePicker variant="foot" />
        </div>
      </div>
    </footer>
  );
}
