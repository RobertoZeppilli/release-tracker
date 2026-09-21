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
  title: "release-tracker",
  description: "Releases of the technologies you follow, summarized like compiler diagnostics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme is set before paint by themeInitScript, so the server markup can differ.
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fragmentMono.variable} ${hankenGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
