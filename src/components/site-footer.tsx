import Link from "next/link";
import { FOOT } from "./site-foot";

// The foot of every page of the app, rendered once by the root layout. It is the wordmark and two
// columns with titles, not the one labelled row the issue first sketched: five destinations on one
// line read as five equal things, and `terms` and `faq` are not the same kind of page. Mono 12px
// over a 1px `rule`, no surface, no shadow and no second container: it sits in the page's own
// container (DESIGN.md, Layout, "The bar's container is the page's container"), so the mark below
// opens under the same letter the mark in the bar opens under.
// The three columns stand side by side at every width, 390px included: the labels are one short
// word each, so nothing here has to stack or fold away behind anything to be reachable.
// ⚠️ `mt-auto`, with the flex column on `body` in `globals.css`: on a short page (the 404, an error,
// a signed-out account) the content does not reach the bottom of the window, and a foot that
// followed it sat halfway up the screen with nothing under it.
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto max-w-content px-4 pb-7 sm:px-5">
      <div className="grid grid-cols-[auto_minmax(0,160px)_minmax(0,160px)] justify-start items-start gap-x-4 gap-y-5 border-t border-rule pt-5 font-mono text-meta sm:gap-x-6">
        {/* DESIGN.md, Brand Mark: the mark appears once more in the page foot, at Meta size. Same
            ink and same colon as in the bar, one step smaller, and the home link it already is. */}
        <Link
          href="/"
          className="mr-2 tracking-[-0.02em] whitespace-nowrap text-text no-underline [font-variant-ligatures:none] sm:mr-5"
        >
          verdict:
        </Link>
        {FOOT.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-text-muted">{group.title}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-faint no-underline hover:text-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
