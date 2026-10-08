import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Fragment_Mono, Hanken_Grotesk } from "next/font/google";
import { themeInitScript } from "@/components/theme";
import { env } from "@/env";
import "./globals.css";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // No data-theme here: themeInitScript writes it before the first paint, and an attribute React
    // never owns is one it cannot reset when a boundary renders the root again. Until the script
    // runs, the CSS default is the dark theme.
    <html lang="en" suppressHydrationWarning className={`${fragmentMono.variable} ${hankenGrotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
