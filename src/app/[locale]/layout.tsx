import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment_Mono, Hanken_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { themeInitScript } from "@/components/theme";
import { env } from "@/env";
import { isLocale, LOCALES } from "@/modules/i18n";
import { LocaleProvider } from "@/modules/i18n/ui";
import "../globals.css";

const fragmentMono = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fragment-mono",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  // `template` so every page reads `<page> · Verdict` and the landing, which has its own claim for
  // a title, keeps it whole through `default`.
  title: { default: "Verdict, understand before you upgrade", template: "%s · Verdict" },
  description: "Releases of the technologies you follow, summarized like compiler diagnostics.",
};

// The five languages are prerendered: the locale is a root parameter, so without this every page
// under it would be rendered on demand and the ISR of the public pages would be the thing that
// paid for the translation (ADR 0008).
export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // A path the proxy did not rewrite reaches here as a locale: `/xx/faq` is not a language, it is
  // a page that does not exist, and the 404 is the honest answer.
  if (!isLocale(locale)) notFound();

  return (
    // No data-theme here: themeInitScript writes it before the first paint, and an attribute React
    // never owns is one it cannot reset when a boundary renders the root again. Until the script
    // runs, the CSS default is the dark theme.
    <html lang={locale} suppressHydrationWarning className={`${fragmentMono.variable} ${hankenGrotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* The language, for the half of the tree that cannot read it from the server: a Client
            Component cannot call `next/root-params`, and every internal link is a client one. */}
        {/* A provider renders no element of its own, so `main` and `footer` stay direct children
            of `body`, which `globals.css` needs them to be. */}
        <LocaleProvider locale={locale}>
          {children}
          {/* The foot belongs to the layout and not to the pages: issue #132 asks the five pages
              that say what the product is to be reachable from every page at every width, and a
              footer each page pasted in is a footer the next page forgets. It carries its own
              container, the same one the pages use. */}
          <SiteFooter />
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
